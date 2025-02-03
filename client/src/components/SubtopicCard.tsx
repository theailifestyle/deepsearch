import { useState } from 'react';
import { Subtopic } from '@/types/content';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface SubtopicCardProps {
  subtopic: Subtopic;
}

export default function SubtopicCard({ subtopic }: SubtopicCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="w-full">
      <CardHeader 
        className="cursor-pointer flex flex-row items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg font-semibold">{subtopic.title}</h3>
        {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </CardHeader>
      
      {expanded && (
        <CardContent>
          <p className="text-muted-foreground mb-4">{subtopic.content}</p>
          
          {subtopic.resources.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Additional Resources:</h4>
              <div className="flex flex-wrap gap-2">
                {subtopic.resources.map((resource, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => window.open(resource.url, '_blank')}
                  >
                    {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
