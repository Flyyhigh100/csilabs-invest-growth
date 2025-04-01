
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminLayout from '@/components/Admin/Layout';

const Admin: React.FC = () => {
  return (
    <AdminLayout title="Admin Dashboard">
      <Outlet />
    </AdminLayout>
  );
};

export default Admin;
