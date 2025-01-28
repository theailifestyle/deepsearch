import { z } from "zod";

export interface Resource {
  type: 'wiki' | 'video' | 'article' | 'book';
  url: string;
  title?: string;
  author?: string;
  difficulty: 'foundational' | 'intermediate' | 'advanced';
}

export interface TimelineEvent {
  date: string;
  event: string;
  description: string;
  significance: string;
  resources: Resource[];
}

export interface TopicContent {
  topic: string;
  shortSummary: string;
  explanations: {
    simple: string;
    detailed: string;
  };
  historicalTimeline: TimelineEvent[];
}