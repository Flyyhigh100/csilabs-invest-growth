import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Payments from "@/pages/Dashboard/Payments";
import Transactions from "@/pages/Dashboard/Transactions";
import Kyc from "@/pages/Dashboard/Kyc";
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProtectedAdminRoute from './components/Admin/ProtectedAdminRoute';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminTransactions from './pages/Admin/Transactions'; 
import AdminUsers from './pages/Admin/Users';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <NotFound />,
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <NotFound />,
  },
  {
    path: "/register",
    element: <Register />,
    errorElement: <NotFound />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
    errorElement: <NotFound />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
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
      <ProtectedAdminRoute>
        <AdminDashboard />
      </ProtectedAdminRoute>
    ),
  },
  {
    path: "/admin/transactions",
    element: (
      <ProtectedAdminRoute>
        <AdminTransactions />
      </ProtectedAdminRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedAdminRoute>
        <AdminUsers />
      </ProtectedAdminRoute>
    ),
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
