
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminHeader from './Layouts/AdminHeader';
import AdminSidebar from './Layouts/AdminSidebar';
import { getAdminNavItems } from './Layouts/AdminNav';
import { toast } from 'sonner';
import { Sheet, SheetContent } from '@/components/ui/sheet';

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

      <div className="flex flex-1 relative">
        {/* Mobile sidebar using Sheet component for better mobile experience */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[240px] bg-white border-r border-gray-200">
            <AdminSidebar navItems={navItems} closeSidebar={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
        
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-lg">
          <AdminSidebar navItems={navItems} />
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
