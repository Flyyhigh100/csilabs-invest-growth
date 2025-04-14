
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

interface AdminSidebarProps {
  navItems: NavItem[];
  closeSidebar?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ navItems, closeSidebar }) => {
  const location = useLocation();
  
  return (
    <div className="w-full h-full flex flex-col bg-white">
      {closeSidebar && (
        <div className="lg:hidden px-4 py-3 flex justify-end border-b border-gray-100">
          <Button variant="ghost" size="icon" onClick={closeSidebar} aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      
      <div className="flex-1 overflow-auto p-3">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              onClick={closeSidebar}
            >
              <span className="mr-3 flex-shrink-0">{item.icon}</span>
              <span className="truncate">{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
