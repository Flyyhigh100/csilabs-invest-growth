
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';
import Index from "@/pages/Index";
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import Dashboard from "@/pages/Dashboard";
import Payments from "@/pages/Dashboard/Payments";
import Transactions from "@/pages/Dashboard/Transactions";
import Kyc from "@/pages/Dashboard/KYCVerification";
import ResetPassword from '@/pages/Auth/ResetPassword';
import NotFound from './pages/NotFound';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProtectedAdminRoute from './components/Admin/ProtectedAdminRoute';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminTransactions from './pages/Admin/Transactions'; 
import AdminUsers from './pages/Admin/Users';
import ForgotPassword from './pages/Auth/ForgotPassword';
import TokenInfo from './pages/TokenInfo';

// We'll create a root layout component that includes the AuthProvider and QueryClientProvider
const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Then we'll create routes that use this layout
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout><Index /></RootLayout>,
    errorElement: <NotFound />,
  },
  {
    path: "/login",
    element: <RootLayout><Login /></RootLayout>,
    errorElement: <NotFound />,
  },
  {
    path: "/register",
    element: <RootLayout><Register /></RootLayout>,
    errorElement: <NotFound />,
  },
  {
    path: "/token-info",
    element: <RootLayout><TokenInfo /></RootLayout>,
    errorElement: <NotFound />,
  },
  {
    path: "/reset-password",
    element: <RootLayout><ResetPassword /></RootLayout>,
    errorElement: <NotFound />,
  },
  {
    path: "/forgot-password",
    element: <RootLayout><ForgotPassword /></RootLayout>,
    errorElement: <NotFound />,
  },
  {
    path: "/dashboard",
    element: (
      <RootLayout>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </RootLayout>
    ),
    errorElement: <NotFound />,
    children: [
      {
        path: "/dashboard/payments",
        element: <Payments />,
      },
      {
        path: "/dashboard/transactions",
        element: <Transactions />,
      },
      {
        path: "/dashboard/kyc",
        element: <Kyc />,
      },
    ],
  },
  
  // Admin routes
  {
    path: "/admin",
    element: (
      <RootLayout>
        <ProtectedAdminRoute>
          <AdminDashboard />
        </ProtectedAdminRoute>
      </RootLayout>
    ),
  },
  {
    path: "/admin/transactions",
    element: (
      <RootLayout>
        <ProtectedAdminRoute>
          <AdminTransactions />
        </ProtectedAdminRoute>
      </RootLayout>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <RootLayout>
        <ProtectedAdminRoute>
          <AdminUsers />
        </ProtectedAdminRoute>
      </RootLayout>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
