
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface AdminSidebarProps {
  navItems: NavItem[];
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ navItems }) => {
  const location = useLocation();
  
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              location.pathname === item.path
                ? 'bg-cbis-blue text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
