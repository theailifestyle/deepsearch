import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const sampleQuestions: Question[] = [
  {
    question: "What is the main focus of Marxist economic analysis?",
    options: [
      "Individual consumer behavior",
      "Class relationships and conflicts",
      "Stock market trends",
      "Government regulations"
    ],
    correctAnswer: 1
  },
  {
    question: "Which text did Marx and Engels publish in 1848?",
    options: [
      "Das Kapital",
      "The German Ideology",
      "The Communist Manifesto",
      "Critique of Political Economy"
    ],
    correctAnswer: 2
  }
];

interface QuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuizModal({ open, onOpenChange }: QuizModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    setShowFeedback(true);
    
    if (currentQuestion < sampleQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(curr => curr + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      }, 2000);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    onOpenChange(false);
  };

  const question = sampleQuestions[currentQuestion];
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quick Quiz</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-4 font-medium">{question.question}</p>
          
          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(value) => setSelectedAnswer(parseInt(value))}
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>

          {showFeedback && (
            <p className={`mt-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect. Try again!'}
            </p>
          )}
        </div>

        <DialogFooter>
          {currentQuestion === sampleQuestions.length - 1 && showFeedback ? (
            <Button onClick={resetQuiz}>Finish Quiz</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={selectedAnswer === null}>
              Submit Answer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
