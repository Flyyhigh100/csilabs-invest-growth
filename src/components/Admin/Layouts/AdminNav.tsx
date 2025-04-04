
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronRight, 
  Home, 
  Users, 
  CheckCircle, 
  FileText,
  CreditCard
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const getAdminNavItems = (): NavItem[] => {
  return [
    {
      label: 'Dashboard',
      path: '/admin',
      icon: <Home size={20} />,
    },
    {
      label: 'KYC Verifications',
      path: '/admin/kyc',
      icon: <CheckCircle size={20} />,
    },
    {
      label: 'Transactions',
      path: '/admin/transactions',
      icon: <CreditCard size={20} />,
    },
    {
      label: 'Users',
      path: '/admin/users',
      icon: <Users size={20} />,
    },
    {
      label: 'Research Documents',
      path: '/admin/research-documents',
      icon: <FileText size={20} />,
    },
  ];
};

interface AdminNavProps {
  items: NavItem[];
}

const AdminNav: React.FC<AdminNavProps> = ({ items }) => {
  const location = useLocation();

  return (
    <nav className="space-y-1">
      {items.map((item, index) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={index}
            to={item.path}
            className={`
              group flex items-center px-4 py-2 text-base font-medium rounded-md
              ${isActive
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
          >
            <div className={`mr-3 ${isActive ? 'text-purple-700' : 'text-gray-400 group-hover:text-gray-500'}`}>
              {item.icon}
            </div>
            {item.label}
            {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
          </Link>
        );
      })}
    </nav>
  );
};

export default AdminNav;
