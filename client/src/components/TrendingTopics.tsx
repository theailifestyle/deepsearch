import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Beaker, History, TrendingUp, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface TrendingTopic {
  title: string;
  type: "history" | "science" | "popculture" | "trending";
  originalTrend?: string; // only for "trending" type
}

interface TrendingTopicsProps {
  onTopicSelect: (topic: string) => void;
  isProcessing: boolean;
}

export default function TrendingTopics({
  onTopicSelect,
  isProcessing = false,
}: TrendingTopicsProps) {
  const { data: topics, isLoading, isFetching } = useQuery({
    queryKey: ["/api/topics/trending"],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const [loadingPhase, setLoadingPhase] = useState("Collecting trends...");

  useEffect(() => {
    if (isLoading || isFetching) {
      let phase = 0;
      const phases = [
        "Collecting global trends...",
        "Analyzing trending topics...",
        "Categorizing content...",
        "Processing educational context...",
        "Enriching topic metadata...",
        "Finalizing educational topics..."
      ];
      
      const interval = setInterval(() => {
        if (phase < phases.length) {
          setLoadingPhase(phases[phase]);
          phase++;
        }
      }, 3500);
      
      return () => clearInterval(interval);
    }
  }, [isLoading, isFetching]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "history":
        return <History className="h-4 w-4" />;
      case "science":
        return <Beaker className="h-4 w-4" />;
      case "popculture":
        return <Film className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  // Group topics by type
  const groupedTopics =
    topics?.reduce(
      (acc: Record<string, TrendingTopic[]>, topic: TrendingTopic) => {
        if (!acc[topic.type]) {
          acc[topic.type] = [];
        }
        acc[topic.type].push(topic);
        return acc;
      },
      {},
    ) || {};

  // Loading skeleton
  if (isLoading || isFetching) {
    return (
      <div>
        <div className="text-center mb-6 text-muted-foreground animate-pulse">
          {loadingPhase}
        </div>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-full">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-24" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} className="h-8 w-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    );
  }

  // Actual content
  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 max-w-[1800px] mx-auto">
      {Object.entries(groupedTopics).map(([type, topicList]) => (
        <Card
          key={type}
          className="h-full bg-card/50 backdrop-blur-sm border-muted"
        >
          <CardContent className="p-4">
            <div className="space-y-3 h-full flex flex-col">
              <div className="flex items-center gap-2 pb-2 border-b">
                {getTypeIcon(type)}
                <h3 className="font-semibold capitalize tracking-tight">
                  {type}
                </h3>
              </div>

              <div className="space-y-2 flex-1">
                {topicList.map((topic, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2.5 px-3 hover:bg-accent/50 transition-colors"
                    onClick={() => onTopicSelect(topic.title)}
                    disabled={isProcessing || isLoading}
                  >
                    <div className="w-full">
                      <h4
                        className="font-medium line-clamp-2 text-sm"
                        title={topic.title}
                      >
                        {topic.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1 opacity-80">
                        {topic.type === "trending" && topic.originalTrend
                          ? `Trending: ${topic.originalTrend}`
                          : `Category: ${topic.type}`}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
