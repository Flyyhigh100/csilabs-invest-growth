import React, { useEffect } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import DashboardHeader from '@/components/Admin/Dashboard/DashboardHeader';
import StatCards from '@/components/Admin/Dashboard/StatCards';
import DetailCards from '@/components/Admin/Dashboard/DetailCards';
import SystemFlowCard from '@/components/Admin/SystemFlow/SystemFlowCard';
import { useDashboardStats } from '@/components/Admin/Dashboard/useDashboardStats';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
  const { data, isLoading, error, refetch } = useDashboardStats();
  
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
      
      <StatCards
        kycCounts={data?.kycCounts || { pending: 0, approved: 0 }}
        pendingTokensCount={data?.pendingTokensCount || 0}
        totalTransactionValue={data?.totalTransactionValue || 0}
        isLoading={isLoading}
      />
      
      <div className="my-6">
        <SystemFlowCard />
      </div>
      
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
