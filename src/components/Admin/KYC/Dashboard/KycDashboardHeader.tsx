
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Users, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { testDirectKycAccess, verifyAdminAccess } from '../KycVerificationsService';

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
      // Verify admin access first
      const isAdmin = await verifyAdminAccess();
      if (!isAdmin) {
        toast.error('You do not have admin permissions to test database access');
        return;
      }
      
      toast.loading('Testing direct database access with updated RLS policies...');
      const results = await testDirectKycAccess();
      const resultsJson = JSON.stringify(results, null, 2);
      onDirectDatabaseTest(resultsJson);
      
      toast.success(`Found ${results.count} KYC records in database with updated RLS policies`);
    } catch (error) {
      console.error('Error testing direct database access with updated RLS:', error);
      toast.error('Failed to test direct database access');
    }
  };
  
  const handleVerifyAdminAccess = async () => {
    try {
      toast.loading('Verifying admin access...');
      const isAdmin = await verifyAdminAccess();
      
      if (isAdmin) {
        toast.success('Admin access verified successfully');
      } else {
        toast.error('You do not have admin permissions');
      }
    } catch (error) {
      console.error('Error verifying admin access:', error);
      toast.error('Failed to verify admin access');
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
            variant="default" 
            size="sm" 
            onClick={onManualRefresh} 
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh KYC Data
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
            variant="outline" 
            size="sm" 
            onClick={handleVerifyAdminAccess} 
            className="flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            Verify Admin Access
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
