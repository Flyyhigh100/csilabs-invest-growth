
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Dashboard/Transactions';
import Profile from './pages/Dashboard/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './components/Admin/Dashboard';
import AdminKycPage from './pages/Admin/KYCVerifications';
import AdminTransactionsPage from './pages/Admin/Transactions';
import AdminSettingsPage from './pages/Admin/Settings';
import TestToolsPage from './pages/Admin/TestTools';
import CoinPaymentsSetupPage from "./pages/Admin/CoinPaymentsSetup";
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: "/transactions",
    element: <ProtectedRoute><Transactions /></ProtectedRoute>,
  },
  {
    path: "/profile",
    element: <ProtectedRoute><Profile /></ProtectedRoute>,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  
  // Admin routes
  {
    path: "/admin",
    element: <AdminRoute><AdminDashboard /></AdminRoute>,
  },
  {
    path: "/admin/kyc",
    element: <AdminRoute><AdminKycPage /></AdminRoute>,
  },
  {
    path: "/admin/transactions",
    element: <AdminRoute><AdminTransactionsPage /></AdminRoute>,
  },
  {
    path: "/admin/settings",
    element: <AdminRoute><AdminSettingsPage /></AdminRoute>,
  },
  {
    path: "/admin/test-tools",
    element: <AdminRoute><TestToolsPage /></AdminRoute>,
  },
  
  // Add the CoinPayments setup route
  {
    path: "/admin/coinpayments-setup",
    element: <AdminRoute><CoinPaymentsSetupPage /></AdminRoute>,
  },
  
  // Add a direct route for easier access
  {
    path: "/coinpayments-setup",
    element: <AdminRoute><CoinPaymentsSetupPage /></AdminRoute>,
  },
]);

export default router;
