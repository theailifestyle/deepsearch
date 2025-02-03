
import { Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import OpenAIIcon from "./icons/OpenAIIcon";
import DeepSeekIcon from "./icons/DeepSeekIcon";

interface ModelToggleProps {
  useDeepSeek: boolean;
  onToggle: (value: boolean) => void;
}

export default function ModelToggle({ useDeepSeek, onToggle }: ModelToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onToggle(!useDeepSeek)}
      className="w-9 h-9"
    >
      <OpenAIIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all data-[deepseek=true]:-rotate-90 data-[deepseek=true]:scale-0" data-deepseek={useDeepSeek} />
      <DeepSeekIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all data-[deepseek=true]:rotate-0 data-[deepseek=true]:scale-100" data-deepseek={useDeepSeek} />
      <span className="sr-only">Toggle AI Model</span>
    </Button>
  );
}
