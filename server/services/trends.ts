import { getJson } from "serpapi";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface TrendingTopic {
  title: string;
  type: "history" | "science" | "popculture" | "sports" | "trending";
  originalTrend?: string;
}

async function generateEducationalTopics(
  trendingSearches: string[],
): Promise<TrendingTopic[]> {
  try {
    console.log("Calling OpenAI to transform topics...");
    const response = await openai.chat.completions.create({
      model: "chatgpt-4o-latest",
      messages: [
        {
          role: "system",
          content: `You are an educational content curator. Simplify trending topics into concise, clear educational titles that are easy to understand. Follow these rules:

1. Convert each trending topic into a simple, commonly recognized educational title. Examples:
   - "mlk files declassified" ➡ "MLK Assassination"
   - "the bachelor" ➡ "The Bachelor"
   - "grammys 2025" ➡ "Grammy Awards"

2. Ensure the core meaning of the original trend is retained while making it more educational and digestible.

3. Provide context for why the topic is trending under "originalTrend", making it readable and informative. Examples:
   - Instead of "mlk files declassified" ➡ "New MLK assassination files have been declassified"
   - Instead of "bills vs chiefs" ➡ "Upcoming NFL playoff game between Bills and Chiefs"
   - Instead of "spain tourist ban" ➡ "Spain introduces new tourism restrictions in major cities"

4. Categorize each topic under one of the following types: "sports", "history", "science", "popculture", "trending".

5. Return a JSON response in this format:

{
  "topics": [
    {
      "title": "string",
      "type": "sports | history | science | popculture | trending",
      "originalTrend": "string (explain why this is trending)"
    }
  ]
}`,
        },
        {
          role: "user",
          content: `Here are the current trending topics: ${JSON.stringify(trendingSearches)}

Please generate simplified educational topics in the JSON format specified above, ensuring topics are concise and meaningful.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const rawContent = response.choices[0].message?.content || "{}";
    let data;
    try {
      data = JSON.parse(rawContent);
    } catch (err) {
      return [];
    }

    const topics: TrendingTopic[] = data.topics || [];
    const finalTopics = topics.map((topic) => {
      if (topic.type === "trending" && !topic.originalTrend) {
        topic.originalTrend = topic.title;
      }
      return topic;
    });

    return finalTopics;
  } catch (error) {
    console.error("Error in generateEducationalTopics:", error);
    return [];
  }
}

export async function getTrendingTopics(): Promise<TrendingTopic[]> {
  try {
    const params = {
      engine: "google_trends_trending_now",
      geo: "US",
      api_key: process.env.SERPAPI_KEY,
    };

    if (!process.env.SERPAPI_KEY) {
      console.error("SERPAPI_KEY is not set in environment variables");
      return [];
    }

    const results = await getJson(params);
    console.log("SERPAPI results:", results);

    const trendingSearches = results?.trending_searches || [];
    if (!trendingSearches.length) {
      console.error("No trending searches found in SERPAPI response:", results);
    }
    const allQueries = trendingSearches
      .map((search: any) =>
        typeof search === "object" ? search.query : search,
      )
      .filter(Boolean);

    const allBreakdowns = trendingSearches.flatMap(
      (search: any) => search.trend_breakdown || [],
    );

    const uniqueTopics = [...new Set([...allQueries, ...allBreakdowns])];
    const topicList = await generateEducationalTopics(uniqueTopics);

    // Group topics by type and limit each category to 5
    const topicsByType = topicList.reduce(
      (acc, topic) => {
        if (!acc[topic.type]) {
          acc[topic.type] = [];
        }
        if (acc[topic.type].length < 5) {
          acc[topic.type].push(topic);
        }
        return acc;
      },
      {} as Record<string, TrendingTopic[]>,
    );

    // Flatten the grouped topics back into a single array
    return Object.values(topicsByType).flat();
  } catch (error) {
    console.error("Error in getTrendingTopics:", error);
    return [];
  }
}
