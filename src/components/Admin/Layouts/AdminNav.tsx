import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  CheckCircleIcon,
  CreditCardIcon,
  BellIcon,
  SettingsIcon,
  InfoIcon,
  BarChart2,
  FileText,
  AlertTriangle,
  Wallet,
  Users,
  Shield
} from 'lucide-react';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

export const getAdminNavItems = (): NavItem[] => {
  return [
    {
      title: 'Dashboard',
      path: '/admin',
      icon: <HomeIcon className="h-5 w-5" />,
    },
    {
      title: 'Reports',
      path: '/admin/reports',
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      title: 'Users',
      path: '/admin/users',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Administrators',
      path: '/admin/admins',
      icon: <Shield className="h-5 w-5" />,
    },
    {
      title: 'KYC Verifications',
      path: '/admin/kyc',
      icon: <CheckCircleIcon className="h-5 w-5" />,
    },
    {
      title: 'Token Distribution',
      path: '/admin/transactions',
      icon: <CreditCardIcon className="h-5 w-5" />,
    },
    {
      title: 'Wallet Portfolio',
      path: '/admin/wallet-portfolio',
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      title: 'Transaction Status',
      path: '/admin/transaction-status',
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      title: 'Token Pricing',
      path: '/admin/token-pricing',
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      title: 'Research Documents',
      path: '/admin/research-documents',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: 'Notifications',
      path: '/admin/notifications',
      icon: <BellIcon className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      path: '/admin/settings',
      icon: <SettingsIcon className="h-5 w-5" />,
    },
    {
      title: 'System Flow',
      path: '/admin/system-flow',
      icon: <InfoIcon className="h-5 w-5" />,
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
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`
              group flex items-center px-4 py-2 text-base font-medium rounded-md
              ${isActive
                ? 'bg-primary-50 text-primary'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
          >
            <div className={`mr-3 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`}>
              {item.icon}
            </div>
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
};

export default AdminNav;
