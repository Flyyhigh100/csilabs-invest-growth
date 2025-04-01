
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Search</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchBar;
