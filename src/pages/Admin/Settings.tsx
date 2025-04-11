
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';

const AdminSettings: React.FC = () => {
  return (
    <AdminLayout title="Settings">
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Admin Settings</h1>
        <p className="text-muted-foreground">
          Settings functionality will be implemented in a future update.
        </p>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
