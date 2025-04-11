
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import { NavbarContextProvider } from './contexts/NavbarContext';
import { TooltipProvider } from '@/components/ui/tooltip';

// Import components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import GlobalLoading from './components/GlobalLoading';

// Import pages
import Index from './pages/Index';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import NotFound from './pages/NotFound';
import TestToolsPage from './pages/Admin/TestTools';
import Payments from './pages/Dashboard/Payments';
import Transactions from './pages/Dashboard/Transactions';

// Import Admin pages explicitly
import AdminDashboard from './pages/Admin/Dashboard';
import AdminTransactionsPage from './pages/Admin/Transactions';
import AdminUsersPage from './pages/Admin/Users';
import AdminKycPage from './pages/Admin/KYCVerifications';
import AdminSettingsPage from './pages/Admin/Settings';
import AdminNotificationsPage from './pages/Admin/Notifications';
import AdminIPNLogsPage from './pages/Admin/IPNLogs'; 
import AdminTransactionToolsPage from './pages/Admin/TransactionTools';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <NavbarContextProvider>
              <TooltipProvider>
                <GlobalLoading />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<div>Dashboard</div>} />
                    <Route path="/dashboard/kyc" element={<div>KYC</div>} />
                    <Route path="/dashboard/transactions" element={<Transactions />} />
                    <Route path="/dashboard/profile" element={<div>Profile</div>} />
                    <Route path="/dashboard/settings" element={<div>Settings</div>} />
                    <Route path="/dashboard/wallet" element={<div>Wallet</div>} />
                    <Route path="/dashboard/payments" element={<Payments />} />
                  </Route>
                  
                  {/* Admin Routes */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/kyc" element={<AdminKycPage />} />
                    <Route path="/admin/users" element={<AdminUsersPage />} />
                    <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
                    <Route path="/admin/transaction-tools" element={<AdminTransactionToolsPage />} />
                    <Route path="/admin/test-tools" element={<TestToolsPage />} />
                    <Route path="/admin/settings" element={<AdminSettingsPage />} />
                    <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
                    <Route path="/admin/ipn-logs" element={<AdminIPNLogsPage />} />
                  </Route>
                  
                  {/* Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster position="top-right" richColors />
              </TooltipProvider>
            </NavbarContextProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
