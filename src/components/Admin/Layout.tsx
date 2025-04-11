
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminHeader from './Layouts/AdminHeader';
import AdminSidebar from './Layouts/AdminSidebar';
import { getAdminNavItems } from './Layouts/AdminNav';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { user } = useAuth();
  
  // Get navigation items
  const navItems = getAdminNavItems();
  
  console.log("AdminLayout rendering with title:", title);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader title="Admin Portal" />

      <div className="flex flex-1">
        <AdminSidebar navItems={navItems} />

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
