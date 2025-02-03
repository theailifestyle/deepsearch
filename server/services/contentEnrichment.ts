import { Resource } from "@/types/content";
import { getJson } from "serpapi";
import OpenAI from "openai";

if (!process.env.SERPAPI_KEY) {
  throw new Error("Missing SERPAPI_KEY in environment variables.");
}

const SERP_API_KEY = process.env.SERPAPI_KEY;
const DEFAULT_RESULT_LIMIT = 2;
const MAX_VIDEO_RESOURCES = 6;
const MAX_BOOK_RESOURCES = 1;

interface SearchParams {
  query: string;
  difficulty?: "foundational" | "intermediate" | "advanced";
}

interface SerpApiParams {
  engine: string;
  q: string;
  api_key: string;
  num?: number;
  location?: string;
  search_query?: string;
}

interface TimelineEvent {
  event: string;
  // other properties can be defined here
}

/**
 * Helper to return difficulty modifiers for queries.
 */
function getDifficultyModifier(
  difficulty: "foundational" | "intermediate" | "advanced" | undefined,
  type: "book" | "article" | "video",
): string {
  if (type === "book") {
    return difficulty === "foundational"
      ? "beginner"
      : difficulty || "advanced";
  }
  if (type === "article") {
    return difficulty === "foundational"
      ? "basics tutorial beginner guide"
      : difficulty === "intermediate"
        ? "intermediate detailed explanation"
        : "advanced in-depth analysis";
  }
  if (type === "video") {
    return difficulty === "foundational"
      ? "tutorial for beginners explanation"
      : difficulty === "intermediate"
        ? "detailed explanation concepts"
        : "advanced concepts lecture";
  }
  return "";
}

/**
 * Searches for resources of a given type.
 */
async function searchResources(
  type: "book" | "article" | "video" | "wiki",
  params: SerpApiParams,
): Promise<Resource[]> {
  try {
    const results = await getJson(params);
    const videoResults = results.video_results || [];
    const movieResults = results.movie_results || [];
    const organicResults = type === "video" ? 
      [...videoResults, ...movieResults] : 
      (results.organic_results || []);

    return organicResults.slice(0, DEFAULT_RESULT_LIMIT).map((result: any) => ({
      type,
      url: result.link,
      title: result.title,
      ...(type === "book" && { author: result.author }),
      ...(type === "video" && { author: result.channel?.name }),
    }));
  } catch (error) {
    console.error(`Error searching ${type}s:`, error);
    return [];
  }
}

function buildGoogleBooksQuery(
  query: string,
  difficulty?: SearchParams["difficulty"],
): string {
  const level =
    difficulty === "foundational" ? "beginner" : difficulty || "advanced";
  return `${query} ${level} level book site:goodreads.com OR site:amazon.com`;
}

export async function searchGoogleBooks(
  params: SearchParams,
): Promise<Resource[]> {
  return searchResources("book", {
    engine: "google",
    q: buildGoogleBooksQuery(params.query, params.difficulty),
    api_key: SERP_API_KEY,
  });
}

export async function searchWikipedia({
  query,
}: SearchParams): Promise<Resource[]> {
  return searchResources("wiki", {
    engine: "google",
    q: `${query} site:wikipedia.org`,
    num: 1,
    api_key: SERP_API_KEY,
  });
}

export async function searchGoogleResults(
  params: SearchParams,
): Promise<Resource[]> {
  const modifiedQuery = `${params.query} ${getDifficultyModifier(params.difficulty, "article")}`;
  return searchResources("article", {
    engine: "google",
    q: modifiedQuery,
    location: "United States",
    api_key: SERP_API_KEY,
  });
}

export async function searchYouTubeContent(
  params: SearchParams,
): Promise<Resource[]> {
  const modifiedQuery = `${params.query} ${getDifficultyModifier(params.difficulty, "video")}`;
  return searchResources("video", {
    engine: "youtube",
    search_query: modifiedQuery,
    api_key: SERP_API_KEY,
  });
}

async function validateResourceRelevancy(
  topic: string,
  event: string,
  resources: Resource[],
): Promise<Resource[]> {
  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY");
    return resources;
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await openai.chat.completions.create({
      model: "o3-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a content quality checker. Evaluate the relevancy of educational resources to their topic.",
        },
        {
          role: "user",
          content: `Review these resources for relevancy to the topic "${topic}" and event "${event}". Return only relevant resources in JSON format:
${JSON.stringify(resources, null, 2)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const messageContent = response.choices?.[0]?.message?.content;
    if (!messageContent) {
      console.error("No message content received from OpenAI.");
      return resources;
    }

    const parsed = JSON.parse(messageContent);
    const validatedResources = parsed.relevant_resources || resources;
    return validatedResources.slice(0, 5);
  } catch (error) {
    console.error("Error validating resource relevancy:", error);
    return resources;
  }
}

export async function enrichTimelineEvents(
  topic: string,
  timeline: TimelineEvent[],
): Promise<(TimelineEvent & { resources: Resource[] })[]> {
  const enrichedTimeline = await Promise.all(
    timeline.map(async (event, index) => {
      const difficulty =
        index < timeline.length / 3
          ? "foundational"
          : index < (2 * timeline.length) / 3
            ? "intermediate"
            : "advanced";

      const searchQuery = `${topic} ${event.event}`;

      const [wiki, articles, videos, books] = await Promise.all([
        searchWikipedia({ query: searchQuery }),
        searchGoogleResults({ query: searchQuery, difficulty }),
        searchYouTubeContent({ query: searchQuery, difficulty }),
        searchGoogleBooks({ query: searchQuery, difficulty }),
      ]);

      const processedVideos = videos.slice(0, MAX_VIDEO_RESOURCES).map((video, index) => ({
        ...video,
        type: 'video' as const,
        difficulty: index < 2 ? 'foundational' : index < 4 ? 'intermediate' : 'advanced'
      }));

      const limitedBooks = books.slice(0, MAX_BOOK_RESOURCES);

      // Include videos in validation
      const validationResources = [...wiki, ...articles, ...limitedBooks, ...processedVideos];

      // Validate all resources including videos
      const validatedResources = await validateResourceRelevancy(
        topic,
        event.event,
        validationResources
      );

      // Sort with videos first
      const finalResources = validatedResources
        .sort((a, b) => (a.type === 'video' ? -1 : b.type === 'video' ? 1 : 0));

      return {
        ...event,
        resources: finalResources,
      };
    }),
  );

  return enrichedTimeline;
}