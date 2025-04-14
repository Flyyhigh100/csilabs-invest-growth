
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
  
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  console.log("AdminLayout rendering with title:", title);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader title="Admin Portal" onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        {/* Mobile sidebar - shown/hidden with state */}
        <div className={`lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
             onClick={() => setSidebarOpen(false)}>
        </div>
        
        <div className={`lg:static fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <AdminSidebar navItems={navItems} closeSidebar={() => setSidebarOpen(false)} />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="mb-4 lg:mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{title}</h2>
          </div>
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
