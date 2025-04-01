
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import HighValueTransactions from '@/components/Admin/HighValueTransactions';

const AdminHighValueApprovalsPage: React.FC = () => {
  return (
    <AdminLayout title="High-Value Transaction Approvals">
      <HighValueTransactions />
    </AdminLayout>
  );
};

export default AdminHighValueApprovalsPage;
