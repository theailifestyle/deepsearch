import OpenAI from "openai";
import { TopicContent } from "../../client/src/types/content";
import { EventEmitter } from "events";
import { enrichTimelineEvents } from "./contentEnrichment";

const deepSeekConfig = {
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
};

const openAIConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.openai.com/v1", // Example OpenAI base URL
};

const getOpenAIConfig = (useDeepSeek: boolean) => {
  return new OpenAI(useDeepSeek ? deepSeekConfig : openAIConfig);
};

export const progressEmitter = new EventEmitter();

async function generateTopicTimeline(
  topic: string,
  useDeepSeek: boolean,
): Promise<any[]> {
  try {
    progressEmitter.emit("progress", {
      phase: "Creating chronological learning journey...",
    });

    const openai = getOpenAIConfig(useDeepSeek);
    const response = await openai.chat.completions.create({
      model: useDeepSeek ? "deepseek-chat" : "o3-mini",
      messages: [
        {
          role: "system",
          content: `You are an educational expert. Present all topics as a chronological journey from their origins through present day developments and future implications. Whether covering historical events, scientific concepts, or abstract ideas, ensure the timeline extends to current period showing how the topic continues to evolve.`,
        },
        {
          role: "user",
          content: `Create a comprehensive chronological timeline for "${topic}" in JSON format, spanning from its origins to present day developments and future implications. For historical topics, use actual dates. For concepts/ideas, use relative ordering (e.g., "Foundation", "Development", "Modern Applications", "Future Trends"). Include 5-8 key points, ensuring the last 1-2 points cover recent developments and current/future implications. Format:
          {
            "timeline": [{
              "date": string (year/date for historical events, or sequential identifier for concepts),
              "event": string (event/concept title),
              "description": string (2-3 sentences explaining what this represents),
              "significance": string (explain its importance in the progression)
            }]
          }

          Structure each point to build on previous knowledge, creating a clear progression from foundational to advanced understanding.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    let timeline =
      JSON.parse(response.choices[0].message.content).timeline || [];

    // Enrich timeline with fresh resources
    timeline = await enrichTimelineEvents(topic, timeline);

    return timeline;
  } catch (error) {
    console.error("Error generating timeline:", error);
    return [];
  }
}

export async function generateTopicContent(
  topic: string,
  useDeepSeek: boolean,
): Promise<TopicContent> {
  try {
    progressEmitter.emit("progress", {
      phase: "Starting comprehensive topic analysis...",
      detail: "Creating chronological learning journey",
    });

    const timeline = await generateTopicTimeline(topic, useDeepSeek);

    progressEmitter.emit("progress", {
      phase: "Generating educational content...",
      detail: "Creating comprehensive explanations",
    });

    const openai = getOpenAIConfig(useDeepSeek);
    const response = await openai.chat.completions.create({
      model: useDeepSeek ? "deepseek-chat" : "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an educational content expert. Generate comprehensive, accurate, and engaging content about the given topic.`,
        },
        {
          role: "user",
          content: `Generate educational content about "${topic}" in JSON format with the following structure:
          {
            "topic": string,
            "shortSummary": string (2-3 sentences),
            "explanations": {
              "simple": string (easy to understand explanation),
              "detailed": string (comprehensive explanation)
            }
          }`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const baseContent = JSON.parse(response.choices[0].message.content);

    progressEmitter.emit("progress", {
      phase: "Finalizing content...",
      detail: "Organizing timeline and verifying resource links",
    });

    return {
      ...baseContent,
      historicalTimeline: timeline,
    };
  } catch (error) {
    console.error("Error generating topic content:", error);
    throw new Error("Failed to generate topic content");
  }
}
