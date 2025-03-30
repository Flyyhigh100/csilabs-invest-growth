
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
  onRefresh: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold">Dashboard Overview</h2>
      <Button 
        variant="outline" 
        size="sm"
        onClick={onRefresh}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh Data
      </Button>
    </div>
  );
};

export default DashboardHeader;
