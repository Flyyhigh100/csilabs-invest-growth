
import { lazy } from 'react';
import { 
  AdminDashboardIcon, 
  TransactionIcon, 
  UsersIcon, 
  SettingsIcon, 
  NotificationIcon 
} from '@/components/Icons';
import {
  WrenchIcon,
  BarChart2
} from 'lucide-react';

// Lazy load admin pages for better performance
const AdminDashboard = lazy(() => import('@/pages/Admin/Dashboard'));
const AdminTransactions = lazy(() => import('@/pages/Admin/Transactions'));
const AdminTransactionAnalytics = lazy(() => import('@/pages/Admin/TransactionAnalytics'));
const AdminUsers = lazy(() => import('@/pages/Admin/Users'));
const AdminSettings = lazy(() => import('@/pages/Admin/Settings'));
const AdminNotifications = lazy(() => import('@/pages/Admin/Notifications'));
const AdminKYC = lazy(() => import('@/components/Admin/KYC'));
const AdminTransactionTools = lazy(() => import('@/pages/Admin/TransactionTools'));

export const adminRoutes = [
  {
    path: '/admin',
    element: <AdminDashboard />,
    meta: {
      title: 'Admin Dashboard',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: '/admin/transactions',
    element: <AdminTransactions />,
    meta: {
      title: 'Token Distribution',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: '/admin/transaction-analytics',
    element: <AdminTransactionAnalytics />,
    meta: {
      title: 'Transaction Analytics',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: '/admin/transaction-tools',
    element: <AdminTransactionTools />,
    meta: {
      title: 'Transaction Tools',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: '/admin/users',
    element: <AdminUsers />,
    meta: {
      title: 'Users Management',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: '/admin/kyc',
    element: <AdminKYC />,
    meta: {
      title: 'KYC Verifications',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: '/admin/settings',
    element: <AdminSettings />,
    meta: {
      title: 'Admin Settings',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: '/admin/notifications',
    element: <AdminNotifications />,
    meta: {
      title: 'Admin Notifications',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
];

export const adminSidebarLinks = [
  {
    title: 'Dashboard',
    path: '/admin',
    icon: <AdminDashboardIcon className="h-5 w-5" />,
  },
  {
    title: 'Users',
    path: '/admin/users',
    icon: <UsersIcon className="h-5 w-5" />,
  },
  {
    title: 'KYC Verifications',
    path: '/admin/kyc',
    icon: <WrenchIcon className="h-5 w-5" />,
  },
  {
    title: 'Token Distribution',
    path: '/admin/transactions',
    icon: <TransactionIcon className="h-5 w-5" />,
  },
  {
    title: 'Transaction Analytics',
    path: '/admin/transaction-analytics',
    icon: <BarChart2 className="h-5 w-5" />,
  },
  {
    title: 'Transaction Tools',
    path: '/admin/transaction-tools',
    icon: <WrenchIcon className="h-5 w-5" />,
  },
  {
    title: 'Notifications',
    path: '/admin/notifications',
    icon: <NotificationIcon className="h-5 w-5" />,
  },
  {
    title: 'Settings',
    path: '/admin/settings',
    icon: <SettingsIcon className="h-5 w-5" />,
  },
];
