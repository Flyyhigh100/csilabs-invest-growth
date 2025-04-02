
import React from 'react';
import { Home, Users, CreditCard, ShieldCheck } from 'lucide-react';

// Define the navigation items for the admin portal
export const getAdminNavItems = () => {
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { path: '/admin/kyc', label: 'KYC Verifications', icon: <ShieldCheck className="h-5 w-5" /> },
    { path: '/admin/transactions', label: 'Transactions', icon: <CreditCard className="h-5 w-5" /> },
    { path: '/admin/users', label: 'Users', icon: <Users className="h-5 w-5" /> },
  ];
  
  return navItems;
};
