
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import TokenInfo from '@/pages/TokenInfo';
import Login from '@/pages/Auth/Login';
import Register from '@/pages/Auth/Register';
import ForgotPassword from '@/pages/Auth/ForgotPassword';
import ResetPassword from '@/pages/Auth/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import Payments from '@/pages/Dashboard/Payments';
import Transactions from '@/pages/Dashboard/Transactions';
import KYCVerification from '@/pages/Dashboard/KYCVerification';
import ProtectedRoute from '@/components/ProtectedRoute';
import NotFound from '@/pages/NotFound';
import { Toaster } from "@/components/ui/toaster"

// Import admin pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminKycPage from './pages/Admin/KYCVerifications';
import AdminTransactionsPage from './pages/Admin/Transactions';
import AdminUsersPage from './pages/Admin/Users';

const App = () => {
  const queryClient = new QueryClient();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/token-info" element={<TokenInfo />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
                <Route index element={<Payments />} />
                <Route path="payments" element={<Payments />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="kyc" element={<KYCVerification />} />
              </Route>
              
              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/kyc" element={<ProtectedRoute><AdminKycPage /></ProtectedRoute>} />
              <Route path="/admin/transactions" element={<ProtectedRoute><AdminTransactionsPage /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </div>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
