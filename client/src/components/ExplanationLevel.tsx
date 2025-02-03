import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Lightbulb } from 'lucide-react';

interface ExplanationLevelProps {
  simple: string;
  detailed: string;
}

export default function ExplanationLevel({ simple, detailed }: ExplanationLevelProps) {
  const [isSimple, setIsSimple] = useState(false);

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={() => setIsSimple(!isSimple)}
        className="flex gap-2"
      >
        {isSimple ? (
          <>
            <Lightbulb className="h-4 w-4" />
            Show Detailed Explanation
          </>
        ) : (
          <>
            <Brain className="h-4 w-4" />
            Make it Simpler
          </>
        )}
      </Button>

      <Card className="transition-all duration-300">
        <CardContent className="pt-6">
          <p className="text-lg leading-relaxed">
            {isSimple ? simple : detailed}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}