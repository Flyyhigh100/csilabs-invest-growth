
import React, { useEffect } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import DashboardHeader from '@/components/Admin/Dashboard/DashboardHeader';
import StatCards from '@/components/Admin/Dashboard/StatCards';
import DetailCards from '@/components/Admin/Dashboard/DetailCards';
import { useDashboardStats } from '@/components/Admin/Dashboard/useDashboardStats';
import { toast } from 'sonner';
import TestDataCard from '@/components/Admin/TestDataManagement/TestDataCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const AdminDashboard: React.FC = () => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    includeTestData,
    setIncludeTestData 
  } = useDashboardStats();
  
  useEffect(() => {
    console.log('Admin Dashboard mounted, fetching data...');
    refetch();
  }, [refetch]);
  
  const handleRefresh = () => {
    console.log('Manual dashboard refresh triggered');
    refetch();
    toast.info('Refreshing dashboard data...');
  };
  
  useEffect(() => {
    if (data) {
      console.log('Dashboard data updated:', data);
    }
  }, [data]);
  
  return (
    <AdminLayout title="Admin Dashboard">
      <DashboardHeader onRefresh={handleRefresh} />
      
      <div className="mb-4 flex items-center justify-end space-x-2">
        <Label htmlFor="include-test-data" className="text-sm font-medium">
          Include test data
        </Label>
        <Switch 
          id="include-test-data" 
          checked={includeTestData} 
          onCheckedChange={setIncludeTestData}
        />
      </div>
      
      <StatCards
        kycCounts={data?.kycCounts || { pending: 0, approved: 0 }}
        pendingTokensCount={data?.pendingTokensCount || 0}
        totalTransactionValue={data?.totalTransactionValue || 0}
        isLoading={isLoading}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <DetailCards
          kycCounts={data?.kycCounts || { 
            pending: 0, 
            approved: 0, 
            rejected: 0, 
            not_started: 0, 
            needs_clarification: 0 
          }}
          pendingTokensCount={data?.pendingTokensCount || 0}
          totalTransactionValue={data?.totalTransactionValue || 0}
          isLoading={isLoading}
          refetch={refetch}
        />
        <TestDataCard />
      </div>
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-800 rounded-md">
          <h3 className="font-bold">Error loading dashboard data</h3>
          <p>{(error as Error).message}</p>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
