
import React from 'react';
import { Button } from '@/components/ui/button';

interface AdminControlsProps {
  isAdminView: boolean;
  toggleAdminView: () => void;
  handleRefreshAll: () => void;
}

const AdminControls = ({ 
  isAdminView, 
  toggleAdminView, 
  handleRefreshAll 
}: AdminControlsProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleAdminView}
      >
        {isAdminView ? 'Show My Transactions' : 'Show All Transactions (Admin)'}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefreshAll}
      >
        Refresh All Pending Transactions
      </Button>
    </div>
  );
};

export default AdminControls;
