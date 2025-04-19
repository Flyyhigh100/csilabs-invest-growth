
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import SystemFlowCard from '@/components/Admin/SystemFlow/SystemFlowCard';

const SystemFlowPage = () => {
  return (
    <AdminLayout title="System Flow">
      <div className="space-y-6">
        <SystemFlowCard />
      </div>
    </AdminLayout>
  );
};

export default SystemFlowPage;
