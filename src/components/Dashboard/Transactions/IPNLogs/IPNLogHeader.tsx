
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface IPNLogHeaderProps {
  onRefresh: () => void;
}

const IPNLogHeader: React.FC<IPNLogHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-medium">Recent IPN Notifications</h3>
      <Button variant="outline" size="sm" onClick={onRefresh}>
        <RefreshCw className="h-3.5 w-3.5 mr-1" />
        Refresh
      </Button>
    </div>
  );
};

export default IPNLogHeader;
