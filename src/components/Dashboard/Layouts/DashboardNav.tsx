
import { Home, User, FileText, Wallet, CreditCard, ShoppingBag, Settings, Shield, Database, LineChart, BookOpenText } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  submenu?: NavItem[];
  admin?: boolean;
}

export const getDashboardNavItems = (): NavItem[] => {
  return [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      title: 'KYC Verification',
      href: '/dashboard/kyc',
      icon: Shield,
    },
    {
      title: 'Transactions',
      href: '/dashboard/transactions',
      icon: CreditCard,
    },
    {
      title: 'Payments',
      href: '/dashboard/payments',
      icon: ShoppingBag,
    },
    {
      title: 'Profile',
      href: '/dashboard/profile',
      icon: User,
    },
    {
      title: 'Wallet',
      href: '/dashboard/wallet',
      icon: Wallet,
    }
  ];
};

export const getAdminNavItem = (): NavItem => {
  return {
    title: 'Admin Panel',
    href: '/admin',
    icon: Settings,
    admin: true,
    submenu: [
      {
        title: 'Dashboard',
        href: '/admin',
        icon: LineChart,
      },
      {
        title: 'KYC Verifications',
        href: '/admin/kyc',
        icon: Shield,
      },
      {
        title: 'Transactions',
        href: '/admin/transactions',
        icon: CreditCard,
      },
      {
        title: 'Users',
        href: '/admin/users',
        icon: User,
      },
      {
        title: 'Research Documents',
        href: '/admin/research-documents',
        icon: BookOpenText,
      },
      {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings,
      },
    ]
  };
};
