
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Users } from 'lucide-react';
import { toast } from 'sonner';
import { testDirectKycAccess } from '../KycVerificationsService';

interface KycDashboardHeaderProps {
  onManualRefresh: () => void;
  onDirectDatabaseTest: (results: string) => void;
  refetch: () => void;
  onToggleShowAllUsers: () => void;
  showAllUsers: boolean;
}

const KycDashboardHeader: React.FC<KycDashboardHeaderProps> = ({ 
  onManualRefresh, 
  onDirectDatabaseTest,
  refetch,
  onToggleShowAllUsers,
  showAllUsers
}) => {
  const handleDirectDatabaseTest = async () => {
    try {
      toast.loading('Testing direct database access...');
      const results = await testDirectKycAccess();
      const resultsJson = JSON.stringify(results, null, 2);
      onDirectDatabaseTest(resultsJson);
      
      toast.success(`Found ${results.count} KYC records in database`);
    } catch (error) {
      console.error('Error testing direct database access:', error);
      toast.error('Failed to test direct database access');
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC Verification Requests</CardTitle>
        <CardDescription>
          Review and process KYC verification requests from users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onManualRefresh} 
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh Data
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDirectDatabaseTest} 
            className="flex items-center gap-1"
          >
            <Database className="h-3 w-3" />
            Test DB Connection
          </Button>
          
          <Button 
            variant={showAllUsers ? "default" : "outline"} 
            size="sm" 
            onClick={onToggleShowAllUsers} 
            className="flex items-center gap-1"
          >
            <Users className="h-3 w-3" />
            {showAllUsers ? "Hide All Users" : "Show All Users"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default KycDashboardHeader;
