
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import IPNLogs from '@/components/Admin/IPNLogs';

const AdminIPNLogsPage: React.FC = () => {
  return (
    <AdminLayout title="IPN Logs">
      <IPNLogs />
    </AdminLayout>
  );
};

export default AdminIPNLogsPage;
