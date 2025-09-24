
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import CommunicationNotificationBadge from '@/components/Admin/Communications/CommunicationNotificationBadge';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

interface AdminSidebarProps {
  navItems: NavItem[];
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ navItems }) => {
  const location = useLocation();
  
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 h-full overflow-y-auto">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors",
              location.pathname === item.path
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-100"
            )}
            onClick={() => {
              // Close any open mobile menus when navigating (handled by parent)
              const event = new CustomEvent('sidebar-navigation');
              window.dispatchEvent(event);
            }}
            >
              <span className="mr-3">{item.icon}</span>
              {item.title}
              {item.title === 'Communications' && <CommunicationNotificationBadge />}
            </Link>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
