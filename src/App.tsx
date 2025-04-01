
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from "@/components/ui/toaster";
import Loading from '@/components/Loading';

// Pages
import Index from '@/pages/Index';
import TokenInfo from '@/pages/TokenInfo';
import Login from '@/pages/Auth/Login';
import Register from '@/pages/Auth/Register';
import ForgotPassword from '@/pages/Auth/ForgotPassword';
import ResetPassword from '@/pages/Auth/ResetPassword';
import Payments from '@/pages/Dashboard/Payments';
import Transactions from '@/pages/Dashboard/Transactions';
import KYCVerification from '@/pages/Dashboard/KYCVerification';
import Documents from '@/pages/Dashboard/Documents';
import Profile from '@/pages/Dashboard/Profile';
import ProtectedRoute from '@/components/ProtectedRoute';
import NotFound from '@/pages/NotFound';

// Admin pages
import Admin from './pages/Admin';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminKycPage from './pages/Admin/KYCVerifications';
import AdminTransactionsPage from './pages/Admin/Transactions';
import AdminUsersPage from './pages/Admin/Users';
import AdminHighValueApprovalsPage from './pages/Admin/HighValueApprovals';

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/token-info" element={<TokenInfo />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Add a redirect from /signup to /register */}
              <Route path="/signup" element={<Navigate to="/register" replace />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected dashboard routes */}
              <Route path="/dashboard" element={<Navigate to="/dashboard/payments" replace />} />
              <Route path="/dashboard/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="/dashboard/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
              <Route path="/dashboard/kyc" element={<ProtectedRoute><KYCVerification /></ProtectedRoute>} />
              <Route path="/dashboard/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
              <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              
              {/* Admin Routes - Note the adminOnly prop */}
              <Route path="/admin" element={<ProtectedRoute adminOnly={true}><Admin /></ProtectedRoute>}>
                <Route path="" element={<AdminDashboard />} />
                <Route path="kyc-verifications" element={<AdminKycPage />} />
                <Route path="transactions" element={<AdminTransactionsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="high-value-approvals" element={<AdminHighValueApprovalsPage />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
