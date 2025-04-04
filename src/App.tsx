
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';

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
import Documents from '@/pages/Dashboard/Documents';
import Profile from '@/pages/Dashboard/Profile';
import ProtectedRoute from '@/components/ProtectedRoute';
import NotFound from '@/pages/NotFound';
import { Toaster } from "@/components/ui/toaster"

// Import admin pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminKycPage from './pages/Admin/KYCVerifications';
import AdminTransactionsPage from './pages/Admin/Transactions';
import AdminUsersPage from './pages/Admin/Users';

const ResearchDocuments = lazy(() => import('./pages/ResearchDocuments'));

const App = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/token-info" element={<TokenInfo />} />
              <Route 
                path="/research-documents" 
                element={
                  <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
                    <ResearchDocuments />
                  </Suspense>
                } 
              />
              
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/signup" element={<Navigate to="/register" replace />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected dashboard routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="/dashboard/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
              <Route path="/dashboard/kyc" element={<ProtectedRoute><KYCVerification /></ProtectedRoute>} />
              <Route path="/dashboard/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
              <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              
              {/* Admin Routes - Note the adminOnly prop */}
              <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/kyc" element={<ProtectedRoute adminOnly={true}><AdminKycPage /></ProtectedRoute>} />
              <Route path="/admin/transactions" element={<ProtectedRoute adminOnly={true}><AdminTransactionsPage /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminUsersPage /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
