
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { addSelfAsAdmin } from '@/utils/admin';

interface KycDashboardHeaderProps {
  onManualRefresh: () => void;
  onDirectDatabaseTest: (results: string | null) => void;
  refetch: () => void;
  onToggleShowAllUsers: () => void;
  showAllUsers: boolean;
}

const KycDashboardHeader: React.FC<KycDashboardHeaderProps> = ({
  onManualRefresh,
  refetch,
  onToggleShowAllUsers,
  showAllUsers
}) => {
  const handleAddSelfAsAdmin = async () => {
    const success = await addSelfAsAdmin();
    if (success) {
      // Refresh the page to apply admin permissions
      setTimeout(() => {
        window.location.reload();
      }, 1500); // Give time for the toast to show
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              onClick={onManualRefresh}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
            
            <Button 
              onClick={onToggleShowAllUsers}
              variant={showAllUsers ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              {showAllUsers ? "Hide All Users" : "Show All Users"}
            </Button>
          </div>
          
          <Button 
            onClick={handleAddSelfAsAdmin}
            variant="secondary"
            className="bg-green-100 hover:bg-green-200 text-green-800"
          >
            Add Self as Admin
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default KycDashboardHeader;
