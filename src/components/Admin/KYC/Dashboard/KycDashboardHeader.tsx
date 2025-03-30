
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { FileSpreadsheet, RefreshCw, Wrench } from 'lucide-react';
import { testDirectKycAccess, createTestKycRecord } from '../KycVerificationsService';
import { useQueryClient } from '@tanstack/react-query';

interface KycDashboardHeaderProps {
  onManualRefresh: () => void;
  onDirectDatabaseTest: (results: string) => void;
  refetch: () => void;
}

const KycDashboardHeader: React.FC<KycDashboardHeaderProps> = ({ 
  onManualRefresh, 
  onDirectDatabaseTest,
  refetch
}) => {
  const queryClient = useQueryClient();
  
  const handleDirectDatabaseTest = async () => {
    try {
      toast.info('Testing direct database connection...');
      
      // CRITICAL FIX: Run direct database test to check connection
      const testResults = await testDirectKycAccess();
      
      // Format results as JSON string for display
      const resultsJson = JSON.stringify({
        count: testResults.count,
        pendingCount: testResults.pendingCount,
        statusCounts: testResults.statusCounts,
        sample: testResults.records.slice(0, 2)
      }, null, 2);
      
      onDirectDatabaseTest(resultsJson);
      
      if (testResults.count > 0) {
        toast.success(`Direct database test successful: Found ${testResults.count} KYC records`);
      } else {
        toast.warning('Direct database test successful but no KYC records found');
      }
      
      // CRITICAL FIX: Force invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      
      // Refetch data
      refetch();
    } catch (error) {
      console.error('Error testing database connection:', error);
      toast.error('Failed to test database connection');
      onDirectDatabaseTest(JSON.stringify({ error: 'Failed to connect to database' }));
    }
  };
  
  const handleCreateTestRecord = async () => {
    try {
      toast.info('Creating test KYC record...');
      
      const success = await createTestKycRecord();
      
      if (success) {
        toast.success('Test KYC record created successfully');
        
        // CRITICAL FIX: Force invalidate queries after creating test record
        queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
        
        // Refetch data after creating test record
        setTimeout(() => {
          refetch();
        }, 500);
      } else {
        toast.error('Failed to create test KYC record');
      }
    } catch (error) {
      console.error('Error creating test record:', error);
      toast.error('Failed to create test KYC record');
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold flex items-center space-x-2">
          <FileSpreadsheet className="h-6 w-6 text-cbis-blue" />
          <span>KYC Verifications</span>
        </CardTitle>
        <CardDescription>
          Review and process KYC verification requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={onManualRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleDirectDatabaseTest}
            className="flex items-center gap-2"
          >
            <Wrench className="h-4 w-4" />
            Test Database Connection
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleCreateTestRecord}
            className="flex items-center gap-2"
          >
            Create Test Record
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default KycDashboardHeader;
