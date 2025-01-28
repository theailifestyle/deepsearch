import { Resource } from "@/types/content";
import { getJson } from "serpapi";

const SERP_API_KEY = process.env.SERPAPI_KEY;

interface SearchParams {
  query: string;
  difficulty?: "foundational" | "intermediate" | "advanced";
}

async function searchResources(
  type: "book" | "article" | "video" | "wiki",
  params: any,
): Promise<Resource[]> {
  try {
    const results = await getJson(params);
    return (results.organic_results || []).slice(0, 2).map((result: any) => ({
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

export async function searchGoogleBooks(
  params: SearchParams,
): Promise<Resource[]> {
  const difficultyLevel =
    params.difficulty === "foundational"
      ? "beginner"
      : params.difficulty === "intermediate"
        ? "intermediate"
        : "advanced";

  return searchResources("book", {
    engine: "google",
    q: `${params.query} ${difficultyLevel} level book site:goodreads.com OR site:amazon.com`,
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
  const modifiedQuery = `${params.query} ${
    params.difficulty === "foundational"
      ? "basics tutorial beginner guide"
      : params.difficulty === "intermediate"
        ? "intermediate detailed explanation"
        : "advanced in-depth analysis"
  }`;

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
  const modifiedQuery = `${params.query} ${
    params.difficulty === "foundational"
      ? "tutorial for beginners explanation"
      : params.difficulty === "intermediate"
        ? "detailed explanation concepts"
        : "advanced concepts lecture"
  }`;

  return searchResources("video", {
    engine: "youtube",
    search_query: modifiedQuery,
    api_key: SERP_API_KEY,
  });
}

export async function enrichTimelineEvents(
  topic: string,
  timeline: any[],
): Promise<any[]> {
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

      return {
        ...event,
        resources: [...wiki, ...articles, ...videos, ...books].slice(0, 5),
      };
    }),
  );

  return enrichedTimeline;
}
