
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, DatabaseIcon, BugIcon } from 'lucide-react';
import { toast } from 'sonner';
import { testDirectKycAccess, createTestKycRecord } from '../KycVerificationsService';

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
  // Direct database test query
  const testDirectDatabaseQuery = async () => {
    try {
      console.log('Running direct database test query for KYC verifications...');
      
      const results = await testDirectKycAccess();
      
      onDirectDatabaseTest(JSON.stringify(results, null, 2));
      
      toast.success(`Found ${results.count} KYC records (${results.pendingCount} pending)`);
      
      // If data exists but none shows in the dashboard, it's likely an RLS or query issue
      if (results.count > 0) {
        console.warn('⚠️ Found records in database, refreshing view');
        toast.info('Records found in database, refreshing view');
      }
      
      refetch(); // Refresh the dashboard data
    } catch (err) {
      console.error('Error in direct database test:', err);
      toast.error('Database test failed');
    }
  };
  
  // Create a test KYC record
  const handleCreateTestRecord = async () => {
    try {
      toast.info('Creating test KYC record...');
      const success = await createTestKycRecord();
      
      if (success) {
        toast.success('Created test KYC record');
        refetch();
      } else {
        toast.error('Failed to create test KYC record');
      }
    } catch (err) {
      console.error('Error creating test record:', err);
      toast.error('Failed to create test record');
    }
  };

  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-bold">KYC Verifications</h3>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={testDirectDatabaseQuery} 
          className="flex items-center gap-2"
        >
          <DatabaseIcon className="h-4 w-4" />
          Database Test
        </Button>
        <Button 
          variant="outline" 
          onClick={handleCreateTestRecord} 
          className="flex items-center gap-2"
        >
          <BugIcon className="h-4 w-4" />
          Create Test Record
        </Button>
        <Button 
          variant="outline" 
          onClick={onManualRefresh} 
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default KycDashboardHeader;
