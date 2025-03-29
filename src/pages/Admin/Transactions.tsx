
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import PendingTransactions from '@/components/Admin/PendingTransactions';

const AdminTransactionsPage: React.FC = () => {
  return (
    <AdminLayout title="Token Distribution">
      <PendingTransactions />
    </AdminLayout>
  );
};

export default AdminTransactionsPage;
