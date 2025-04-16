
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminHeader from './Layouts/AdminHeader';
import AdminSidebar from './Layouts/AdminSidebar';
import { getAdminNavItems } from './Layouts/AdminNav';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Get navigation items
  const navItems = getAdminNavItems();
  
  console.log("AdminLayout rendering with title:", title);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader title="Admin Portal" />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AdminSidebar navItems={navItems} />
        </div>
        
        {/* Mobile Sidebar with Sheet */}
        <div className="md:hidden">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="absolute top-4 left-4 z-50 h-10 w-10"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <div className="pt-14">
                <AdminSidebar navItems={navItems} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 overflow-auto mt-14 md:mt-0">
          <div className="mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
