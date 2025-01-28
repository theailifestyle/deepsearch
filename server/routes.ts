import type { Express } from "express";
import { createServer, type Server } from "http";
import { generateTopicContent, progressEmitter } from "./services/openai";
import { getTrendingTopics } from "./services/trends";

export function registerRoutes(app: Express): Server {
  // Topic search endpoint
  app.post("/api/topics/search", async (req, res) => {
    try {
      const { query } = req.body;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Query is required" });
      }

      progressEmitter.emit('progress', {
        phase: 'Analyzing topic...',
        detail: 'Gathering historical context and educational resources'
      });

      const content = await generateTopicContent(query);

      // Ensure each timeline event has properly categorized resources
      content.historicalTimeline = content.historicalTimeline.map(event => ({
        ...event,
        resources: event.resources || [],
      }));

      res.json(content);
    } catch (error) {
      console.error("Error searching topics:", error);
      res.status(500).json({ message: "Failed to search topics" });
    }
  });

  // Trending topics endpoint
  app.get("/api/topics/trending", async (_req, res) => {
    console.log("Received request for trending topics");
    try {
      const topics = await getTrendingTopics();
      console.log("Returning trending topics:", topics);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching trending topics:", error);
      res.status(500).json({ message: "Failed to fetch trending topics" });
    }
  });

  // Progress updates endpoint using Server-Sent Events
  app.get("/api/topics/progress", (req, res) => {
    const { topic } = req.query;

    if (!topic) {
      return res.status(400).json({ message: "Topic parameter is required" });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial message
    res.write(`data: ${JSON.stringify({ phase: 'Starting content generation...', detail: 'Initializing topic analysis' })}\n\n`);

    // Listen for progress updates
    const progressHandler = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    progressEmitter.on('progress', progressHandler);

    // Clean up when client disconnects
    req.on('close', () => {
      progressEmitter.removeListener('progress', progressHandler);
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}