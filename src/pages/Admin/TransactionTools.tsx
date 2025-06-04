
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import ManualStatusUpdate from '@/components/Admin/ManualStatusUpdate';
import TransactionToolbox from '@/components/Admin/TransactionToolbox';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useStandardizedAdminVerification } from '@/hooks/admin/useStandardizedAdminVerification';

const TransactionToolsPage: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isLoading, error } = useStandardizedAdminVerification();

  // Show loading state while checking admin status
  if (isLoading) {
    return (
      <AdminLayout title="Transaction Tools">
        <div className="flex items-center justify-center h-40 md:h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-xs md:text-sm text-muted-foreground">Checking admin permissions...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Show error state
  if (error) {
    return (
      <AdminLayout title="Transaction Tools">
        <div className="flex items-center justify-center h-40 md:h-64">
          <div className="text-center">
            <p className="text-red-600">Failed to verify admin permissions</p>
            <p className="text-gray-600 mt-2">{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Redirect if not admin
  if (isAdmin === false) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AdminLayout title="Transaction Tools">
      <div className="space-y-4 md:space-y-6">
        <p className="text-xs md:text-sm text-muted-foreground">
          Tools for manually managing transactions and resolving issues.
        </p>
        
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="min-w-[600px] md:min-w-full px-4 md:px-0">
            <TransactionToolbox />
          </div>
        </div>
        
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="min-w-[600px] md:min-w-full px-4 md:px-0">
            <ManualStatusUpdate />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TransactionToolsPage;
