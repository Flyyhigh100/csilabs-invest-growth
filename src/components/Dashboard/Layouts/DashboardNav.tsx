
import React from 'react';
import { 
  User, 
  CreditCard, 
  FileText, 
  UserCheck, 
  LayoutDashboard,
  DollarSign,
  ShieldCheck
} from 'lucide-react';

// Define the navigation items for the dashboard
export const getDashboardNavItems = () => {
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Buy Tokens', href: '/dashboard/payments', icon: <DollarSign className="h-5 w-5" /> },
    { name: 'KYC Verification', href: '/dashboard/kyc', icon: <UserCheck className="h-5 w-5" /> },
    { name: 'Transactions', href: '/dashboard/transactions', icon: <CreditCard className="h-5 w-5" /> },
    { name: 'Documents', href: '/dashboard/documents', icon: <FileText className="h-5 w-5" /> },
    { name: 'Profile', href: '/dashboard/profile', icon: <User className="h-5 w-5" /> },
  ];
  
  return navItems;
};

// Define the admin navigation item
export const getAdminNavItem = () => {
  return { name: 'Admin Portal', href: '/admin', icon: <ShieldCheck className="h-5 w-5" /> };
};
