
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import ManualStatusUpdate from '@/components/Admin/ManualStatusUpdate';
import TransactionToolbox from '@/components/Admin/TransactionToolbox';

const TransactionToolsPage: React.FC = () => {
  return (
    <AdminLayout title="Transaction Tools">
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Tools for manually managing transactions and resolving issues.
        </p>
        
        <TransactionToolbox />
        
        <ManualStatusUpdate />
      </div>
    </AdminLayout>
  );
};

export default TransactionToolsPage;
