import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  initialQuery?: string;
}

export default function SearchBar({ onSearch, isLoading = false, initialQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl mx-auto">
      <Input
        type="text"
        placeholder="What would you like to learn about?"
        value={query}
        onChange={(e) => !isLoading && setQuery(e.target.value)}
        className="flex-1"
        disabled={isLoading}
        aria-disabled={isLoading}
      />
      <Button 
        type="submit" 
        disabled={isLoading}
        aria-disabled={isLoading}
        className={isLoading ? 'cursor-not-allowed opacity-50' : ''}
      >
        <Search className="h-4 w-4 mr-2" />
        {isLoading ? 'Searching...' : 'Search'}
      </Button>
    </form>
  );
}