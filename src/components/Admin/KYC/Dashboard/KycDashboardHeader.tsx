
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
        </div>
      </CardContent>
    </Card>
  );
};

export default KycDashboardHeader;
