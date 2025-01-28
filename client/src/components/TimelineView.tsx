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
                {event.resources?.map((resource, index) => (
                  <Button
                    key={index}
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
                      {getResourceIcon(resource.type)}
                      <span className="ml-2 truncate flex-1">
                        {resource.title || resource.url}
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