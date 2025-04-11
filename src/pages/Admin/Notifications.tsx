
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';

const AdminNotifications: React.FC = () => {
  return (
    <AdminLayout title="Notifications">
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Admin Notifications</h1>
        <p className="text-muted-foreground">
          Notifications management functionality will be implemented in a future update.
        </p>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
