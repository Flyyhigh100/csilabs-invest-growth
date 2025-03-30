
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import DashboardHeader from '@/components/Admin/Dashboard/DashboardHeader';
import StatCards from '@/components/Admin/Dashboard/StatCards';
import DetailCards from '@/components/Admin/Dashboard/DetailCards';
import { useDashboardStats } from '@/components/Admin/Dashboard/useDashboardStats';

const AdminDashboard: React.FC = () => {
  const { data, isLoading, error, refetch } = useDashboardStats();
  
  const handleRefresh = () => {
    refetch();
  };
  
  return (
    <AdminLayout title="Admin Dashboard">
      <DashboardHeader onRefresh={handleRefresh} />
      
      <StatCards
        kycCounts={data?.kycCounts || { pending: 0, approved: 0 }}
        pendingTokensCount={data?.pendingTokensCount || 0}
        totalTransactionValue={data?.totalTransactionValue || 0}
        isLoading={isLoading}
      />
      
      <DetailCards
        kycCounts={data?.kycCounts || { pending: 0, approved: 0, rejected: 0, not_started: 0, needs_clarification: 0 }}
        pendingTokensCount={data?.pendingTokensCount || 0}
        totalTransactionValue={data?.totalTransactionValue || 0}
        isLoading={isLoading}
        refetch={refetch}
      />
    </AdminLayout>
  );
};

export default AdminDashboard;
