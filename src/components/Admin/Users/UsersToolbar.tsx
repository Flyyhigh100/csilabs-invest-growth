
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw } from 'lucide-react';

interface UsersToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const UsersToolbar: React.FC<UsersToolbarProps> = ({
  searchQuery,
  onSearchChange,
  onRefresh,
  isLoading = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users by name, email, or wallet..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Loading...' : 'Refresh'}
      </Button>
    </div>
  );
};

export default UsersToolbar;
