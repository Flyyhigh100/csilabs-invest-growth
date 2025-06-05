
import React from 'react';
import { Search, RefreshCw, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface UsersToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onTestDbConnection: () => void;
  onDownloadCsv?: () => void;
  isDownloading?: boolean;
}

const UsersToolbar: React.FC<UsersToolbarProps> = ({ 
  searchQuery, 
  onSearchChange, 
  onRefresh,
  onDownloadCsv,
  isDownloading = false
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input 
          type="search"
          placeholder="Search users..." 
          className="pl-8 w-[300px]"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        {onDownloadCsv && (
          <Button 
            variant="outline" 
            onClick={onDownloadCsv}
            className="flex items-center gap-2"
            disabled={isDownloading}
          >
            <Download className="h-4 w-4" />
            {isDownloading ? 'Exporting...' : 'Export CSV'}
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default UsersToolbar;
