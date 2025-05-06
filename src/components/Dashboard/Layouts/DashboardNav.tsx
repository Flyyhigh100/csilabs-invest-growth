
import React from 'react';
import { Home, Wallet, FileText, User, ShieldCheck } from 'lucide-react';

export interface NavItem {
  title: string;
  path: string;
  icon?: React.ReactNode;
  description?: string;
}

export const getDashboardNavItems = (): NavItem[] => {
  return [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <Home className="h-5 w-5" />,
      description: 'Overview of your account and activities'
    },
    {
      title: 'Buy Tokens',
      path: '/dashboard/payments',
      icon: <Wallet className="h-5 w-5" />,
      description: 'Purchase CSI tokens using different payment methods'
    },
    {
      title: 'Transactions',
      path: '/dashboard/transactions',
      icon: <FileText className="h-5 w-5" />,
      description: 'View your transaction history'
    },
    {
      title: 'Profile',
      path: '/dashboard/profile',
      icon: <User className="h-5 w-5" />,
      description: 'Manage your account settings'
    },
  ];
};

export const getAdminNavItem = (): NavItem => {
  return {
    title: 'Admin Portal',
    path: '/admin',
    icon: <ShieldCheck className="h-5 w-5" />,
    description: 'Access administrative tools and settings'
  };
};
