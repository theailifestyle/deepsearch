import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import LearningPath from '@/components/LearningPath';
import ExplanationLevel from '@/components/ExplanationLevel';
import TrendingTopics from '@/components/TrendingTopics';
import ThemeToggle from '@/components/ThemeToggle';
import { TopicContent } from '@/types/content';
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';

interface LoadingState {
  phase: string;
  detail?: string;
}

// ModelToggle component (needs to be created separately)
import { default as ModelToggleComponent } from '@/components/ModelToggle';

const ModelToggle = ({ useDeepSeek, onToggle }: { useDeepSeek: boolean; onToggle: (value: boolean) => void }) => {
  return <ModelToggleComponent useDeepSeek={useDeepSeek} onToggle={onToggle} />;
};


export default function TopicView() {
  const [searchedTopic, setSearchedTopic] = useState<TopicContent | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState | null>(null);
  const [showTrending, setShowTrending] = useState(false);
  const [useDeepSeek, setUseDeepSeek] = useState(false);
  const [theme, setTheme] = useState('light'); // Added state for theme
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    try {
      setLoadingState({ 
        phase: "Starting topic analysis...",
        detail: "Initializing content generation"
      });

      const eventSource = new EventSource(`/api/topics/progress?topic=${encodeURIComponent(query)}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Progress update:', data); 
        setLoadingState({
          phase: data.phase || "Processing...",
          detail: data.detail || "Generating content"
        });
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
      };

      const response = await fetch('/api/topics/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const content = await response.json();
      setSearchedTopic(content);
      eventSource.close();
      setLoadingState(null);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "Failed to get topic information. Please try again.",
        variant: "destructive",
      });
      setLoadingState(null);
    }
  };

  if (!searchedTopic) {
    return (
      <div className="min-h-screen bg-background">
        <div className="absolute top-4 right-4 flex items-center gap-4">
          <div className="flex flex-col items-center">
            <ModelToggle useDeepSeek={useDeepSeek} onToggle={setUseDeepSeek} />
            <span className="text-xs text-muted-foreground mt-1">
              {useDeepSeek ? 'DeepSeek' : 'OpenAI'}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <ThemeToggle />
            <span className="text-xs text-muted-foreground mt-1">Theme</span>
          </div>
          </div>
          <div className="container mx-auto px-4 py-32">
          <div className="text-center mb-12">
            <div className="relative inline-block">
              <img src="/logo.png" alt="" className="w-64 h-64 opacity-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              <h1 className="text-5xl font-bold mb-2 text-indigo-600 dark:text-indigo-400 relative z-10">DeepSearch.Guru</h1>
            </div>
            <p className="text-2xl text-primary dark:text-[#FF9800] mb-8">Learn Anything</p>
            <p className="text-xl text-muted-foreground dark:text-[#FF9800] max-w-2xl mx-auto mb-8">
              Search any topic to get a structured learning path with explanations and resources.
              Try "Quantum Physics", "Renaissance Art", or "Climate Change".
            </p>
          </div>
          <SearchBar onSearch={handleSearch} isLoading={!!loadingState} />
          {loadingState ? (
            <div className="mt-8">
              <div className="h-24 flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-2 text-primary dark:text-[#FF9800]">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <p className="text-lg font-medium min-w-[200px] text-center text-foreground dark:text-[#FF9800]">
                    {loadingState.phase}
                  </p>
                </div>
                {loadingState.detail && (
                  <p className="text-sm text-muted-foreground dark:text-[#FF9800]/80 text-center max-w-md">
                    {loadingState.detail}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-16 space-y-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-trending"
                    checked={showTrending}
                    onCheckedChange={setShowTrending}
                  />
                  <Label htmlFor="show-trending" className="text-sm text-muted-foreground cursor-pointer">
                    Find inspiration from current trends
                  </Label>
                </div>
              </div>

              {showTrending && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Explore Topics</h2>
                  <TrendingTopics 
                    onTopicSelect={handleSearch} 
                    isProcessing={!!loadingState}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row items-center gap-4 md:justify-between mb-4 md:mb-8">
          <div className="w-full md:w-auto flex items-center gap-4">
            <a href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 md:w-10 md:h-10 opacity-80" />
              <h2 className="text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-400">DeepSearch.Guru</h2>
            </a>
          </div>
          <div className="w-full md:w-auto">
            <SearchBar 
              onSearch={handleSearch} 
              isLoading={!!loadingState}
              initialQuery={searchedTopic?.topic || ''}
              disabled={!!loadingState}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <ModelToggle useDeepSeek={useDeepSeek} onToggle={setUseDeepSeek} />
              <span className="text-xs text-muted-foreground mt-1">
                {useDeepSeek ? 'DeepSeek' : 'OpenAI'}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <ThemeToggle />
              <span className="text-xs text-muted-foreground mt-1">
                {theme === 'light' ? 'Light' : 'Dark'}
              </span>
            </div>
          </div>
        </div>

        {loadingState ? (
          <div className="mt-8">
            <div className="h-24 flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-2 text-primary dark:text-[#FF9800]">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="text-lg font-medium min-w-[200px] text-center text-foreground dark:text-[#FF9800]">
                  {loadingState.phase}
                </p>
              </div>
              {loadingState.detail && (
                <p className="text-sm text-muted-foreground dark:text-[#FF9800]/80 text-center max-w-md">
                  {loadingState.detail}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            <header className="text-center">
              <h1 className="text-4xl font-bold mb-4">{searchedTopic.topic}</h1>
              <p className="text-xl text-muted-foreground dark:text-[#FF9800]">{searchedTopic.shortSummary}</p>
            </header>

            <ExplanationLevel 
              simple={searchedTopic.explanations.simple} 
              detailed={searchedTopic.explanations.detailed}
            />

            <LearningPath 
              historicalTimeline={searchedTopic.historicalTimeline} 
              topic={searchedTopic.topic}
              description={searchedTopic.shortSummary}
            />
          </div>
        )}
      </div>
    </div>
  );
}