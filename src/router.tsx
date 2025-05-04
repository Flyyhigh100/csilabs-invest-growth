import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Dashboard/Transactions';
import Profile from './pages/Dashboard/Profile';
import AuthLayout from './components/Auth/Layout';
import SignIn from './pages/Auth/SignIn';
import SignUp from './pages/Auth/SignUp';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import AuthRoute from './components/AuthRoute';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './components/Admin/Dashboard';
import KycManagement from './pages/Admin/KycManagement';
import TransactionManagement from './pages/Admin/TransactionManagement';
import AdminSettings from './pages/Admin/Settings';
import TestToolsPage from './pages/Admin/TestTools';
import CoinPaymentsSetupPage from "./pages/Admin/CoinPaymentsSetup";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/dashboard",
    element: <AuthRoute><Dashboard /></AuthRoute>,
  },
  {
    path: "/transactions",
    element: <AuthRoute><Transactions /></AuthRoute>,
  },
  {
    path: "/profile",
    element: <AuthRoute><Profile /></AuthRoute>,
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "signin",
        element: <SignIn />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
    ],
  },
  
  // Admin routes
  {
    path: "/admin",
    element: <AdminRoute />,
    children: [
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "kyc",
        element: <KycManagement />,
      },
      {
        path: "transactions",
        element: <TransactionManagement />,
      },
      {
        path: "settings",
        element: <AdminSettings />,
      },
      {
        path: "test-tools",
        element: <TestToolsPage />,
      },
      
      // Add the CoinPayments setup route
      {
        path: "coinpayments-setup",
        element: <CoinPaymentsSetupPage />,
      },
      
    ],
  },
  
  // Add a direct route for easier access
  {
    path: "/coinpayments-setup",
    element: <AdminRoute><CoinPaymentsSetupPage /></AdminRoute>,
  },
  
]);

export default router;
