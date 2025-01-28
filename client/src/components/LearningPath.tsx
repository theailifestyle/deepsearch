import { useCallback, useState } from 'react';
import { TimelineEvent, Resource } from '@/types/content';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Book,
  Youtube,
  Globe,
  History,
  ChevronDown,
  Download,
} from 'lucide-react';
import { SiWikipedia } from 'react-icons/si';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PDFDownloadLink } from '@react-pdf/renderer';
import CheatsheetPDF from './CheatsheetPDF';

interface LearningPathProps {
  historicalTimeline: TimelineEvent[];
  topic?: string;
  description?: string;
}

export default function LearningPath({ historicalTimeline = [], topic = '', description = '' }: LearningPathProps) {
  const [isTimelineOpen, setIsTimelineOpen] = useState(true);

  const renderResourceIcon = (type: string) => {
    const iconClass = "h-3 w-3 flex-shrink-0";
    switch (type) {
      case 'article':
        return <Globe className={iconClass} />;
      case 'video':
        return <Youtube className={iconClass} />;
      case 'wiki':
        return <SiWikipedia className={iconClass} />;
      case 'book':
        return <Book className={iconClass} />;
      default:
        return <Globe className={iconClass} />;
    }
  };

  const renderResource = (resource: Resource) => (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "w-full justify-start text-left h-auto py-2 min-h-[36px]",
        resource.difficulty === 'foundational' ? 'border-l-2 border-l-green-500' :
        resource.difficulty === 'intermediate' ? 'border-l-2 border-l-blue-500' :
        'border-l-2 border-l-purple-500'
      )}
      onClick={() => window.open(resource.url, '_blank')}
    >
      <span className="flex items-center min-w-0 w-full">
        {renderResourceIcon(resource.type)}
        <span className="ml-2 truncate flex-1" title={`${resource.title}${resource.author ? ` - ${resource.author}` : ''}`}>
          {resource.title}
          {resource.author && ` - ${resource.author}`}
        </span>
        <span className={cn(
          "px-2 py-0.5 rounded-full text-xs font-medium ml-2",
          resource.difficulty === 'foundational' ? 'bg-green-100 text-green-700' :
          resource.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-700' :
          'bg-purple-100 text-purple-700'
        )}>
          {resource.difficulty}
        </span>
      </span>
    </Button>
  );

  const groupResourcesByType = (resources: Resource[]) => {
    const grouped = {
      video: resources.filter(r => r.type === 'video'),
      article: resources.filter(r => r.type === 'article'),
      wiki: resources.filter(r => r.type === 'wiki'),
      book: resources.filter(r => r.type === 'book'),
    };
    return grouped;
  };

  return (
    <div className="space-y-8" data-learning-path>
      <Card>
        <Collapsible
          open={isTimelineOpen}
          onOpenChange={setIsTimelineOpen}
          className="w-full"
        >
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Topic Deep Dive</h2>
                <p className="text-sm text-muted-foreground mt-1">Explore key events and their significance</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PDFDownloadLink
                document={
                  <CheatsheetPDF
                    topic={topic}
                    description={description}
                    historicalTimeline={historicalTimeline}
                  />
                }
                fileName={`${topic.toLowerCase().replace(/\s+/g, '_')}_timeline.pdf`}
              >
                {({ loading }) => (
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    {loading ? 'Generating PDF...' : 'Download Timeline'}
                  </Button>
                )}
              </PDFDownloadLink>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                    isTimelineOpen ? "transform rotate-180" : ""
                  }`}/>
                  <span className="sr-only">Toggle timeline</span>
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="relative pl-6 space-y-8">
                {historicalTimeline.map((event, index) => (
                  <div key={index} className="relative">
                    {index < historicalTimeline.length - 1 && (
                      <div className="absolute left-0 top-4 w-[2px] h-[calc(100%+2rem)] bg-muted" />
                    )}
                    <div className="absolute left-[-0.5rem] top-2 w-4 h-4 rounded-full bg-card border-2 border-primary" />
                    <div className="pl-6">
                      <span className="text-lg font-bold text-primary dark:text-[#FF9800] bg-primary/5 px-3 py-1 rounded-full inline-block">
                        {event.date}
                      </span>
                      <h3 className="text-lg font-semibold mt-3 text-foreground dark:text-[#FF9800]">{event.event}</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {event.description}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        Significance: {event.significance}
                      </p>

                      {event.resources && event.resources.length > 0 && (
                        <div className="mt-4 space-y-4">
                          {Object.entries(groupResourcesByType(event.resources)).map(([type, resources]) => 
                            resources.length > 0 && (
                              <div key={type} className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  {type === 'video' && <Youtube className="h-4 w-4" />}
                                  {type === 'article' && <Globe className="h-4 w-4" />}
                                  {type === 'wiki' && <SiWikipedia className="h-4 w-4" />}
                                  {type === 'book' && <Book className="h-4 w-4" />}
                                  <span>{type.charAt(0).toUpperCase() + type.slice(1)} Resources:</span>
                                </div>
                                <div className="grid gap-2">
                                  {resources.map((resource, idx) => (
                                    <div key={idx} className="min-w-0">
                                      {renderResource(resource)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}