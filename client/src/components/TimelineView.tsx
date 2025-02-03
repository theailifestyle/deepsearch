import { TimelineEvent } from '@/types/content';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TimelineViewProps {
  events: TimelineEvent[];
  getResourceIcon: (type: string) => JSX.Element; // Added to handle icon retrieval
}

export default function TimelineView({ events, getResourceIcon }: TimelineViewProps) {
  console.log('TimelineView received events:', events);
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="flex p-4 gap-4">
        {events.map((event, index) => (
          <Card key={index} className="inline-block min-w-[300px]">
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className="text-2xl font-bold text-primary">{event.date}</div>
                <h3 className="font-semibold">{event.event}</h3>
                <p className="text-sm text-muted-foreground whitespace-normal">
                  {event.description}
                </p>
                {event.resources?.sort((a, b) => {
                  // Sort videos first, then by difficulty
                  if (a.type === 'video' && b.type !== 'video') return -1;
                  if (a.type !== 'video' && b.type === 'video') return 1;
                  return 0;
                }).map((resource, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-left h-auto py-2 min-h-[36px]",
                      resource.type === 'video' 
                        ? 'border-l-2 border-l-red-500 bg-red-50/50 hover:bg-red-100/50 dark:bg-red-950/10 dark:hover:bg-red-950/20' 
                        : resource.difficulty === 'foundational' 
                          ? 'border-l-2 border-l-green-500 bg-green-50/50 hover:bg-green-100/50' 
                          : resource.difficulty === 'intermediate' 
                            ? 'border-l-2 border-l-blue-500 bg-blue-50/50 hover:bg-blue-100/50' 
                            : 'border-l-2 border-l-purple-500 bg-purple-50/50 hover:bg-purple-100/50'
                    )}
                    onClick={() => window.open(resource.url, '_blank')}
                  >
                    <span className="flex items-center min-w-0 w-full">
                      {getResourceIcon(resource.type)}
                      <span className="ml-2 truncate flex-1">
                        {resource.title || resource.url}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium ml-2",
                        resource.type === 'video' ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400' :
                        resource.difficulty === 'foundational' ? 'bg-green-100 text-green-700' :
                        resource.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      )}>
                        {resource.type === 'video' ? 'Video' : resource.difficulty}
                      </span>
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}