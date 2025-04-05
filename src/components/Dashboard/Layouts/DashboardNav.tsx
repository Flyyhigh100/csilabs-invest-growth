
import React from 'react';
import { 
  User, 
  CreditCard, 
  FileText, 
  UserCheck, 
  DollarSign,
  ShieldCheck
} from 'lucide-react';

// Define the navigation items for the dashboard with helpful descriptions
export const getDashboardNavItems = () => {
  const navItems = [
    { 
      name: 'Buy Tokens', 
      href: '/dashboard/payments', 
      icon: <DollarSign className="h-5 w-5" />,
      description: "Purchase CSi tokens with credit card or cryptocurrency"
    },
    { 
      name: 'KYC Verification', 
      href: '/dashboard/kyc', 
      icon: <UserCheck className="h-5 w-5" />,
      description: "Complete identity verification for large cryptocurrency purchases"
    },
    { 
      name: 'Transactions', 
      href: '/dashboard/transactions', 
      icon: <CreditCard className="h-5 w-5" />,
      description: "View your transaction history and payment status" 
    },
    { 
      name: 'Documents', 
      href: '/dashboard/documents', 
      icon: <FileText className="h-5 w-5" />,
      description: "Access research documents and legal information"
    },
    { 
      name: 'Profile', 
      href: '/dashboard/profile', 
      icon: <User className="h-5 w-5" />,
      description: "Manage your account settings and personal details"
    },
  ];
  
  return navItems;
};

// Define the admin navigation item
export const getAdminNavItem = () => {
  return { 
    name: 'Admin Portal', 
    href: '/admin', 
    icon: <ShieldCheck className="h-5 w-5" />,
    description: "Access administrative tools and settings"
  };
};
