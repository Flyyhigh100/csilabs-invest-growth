import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationsProvider } from '@mantine/notifications';
import { Toaster } from 'sonner';
import { NavbarContextProvider } from './contexts/NavbarContext';

// Import pages
import Home from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import ResetPasswordPage from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import KYC from './pages/Dashboard/KYC';
import Transactions from './pages/Dashboard/Transactions';
import Profile from './pages/Dashboard/Profile';
import Settings from './pages/Dashboard/Settings';
import Wallet from './pages/Dashboard/Wallet';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminKYCVerification from './pages/Admin/KYCVerification';
import AdminUsers from './pages/Admin/Users';
import AdminTransactionsPage from './pages/Admin/Transactions';
import TransactionToolsPage from './pages/Admin/TransactionTools';
import TestToolsPage from './pages/Admin/TestTools';
import NotFound from './pages/NotFound';

// Import components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import GlobalLoading from './components/GlobalLoading';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationsProvider>
            <NavbarContextProvider>
              <GlobalLoading />
              <Router>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/kyc" element={<KYC />} />
                    <Route path="/dashboard/transactions" element={<Transactions />} />
                    <Route path="/dashboard/profile" element={<Profile />} />
                    <Route path="/dashboard/settings" element={<Settings />} />
                    <Route path="/dashboard/wallet" element={<Wallet />} />
                  </Route>
                  
                  {/* Admin Routes */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/kyc" element={<AdminKYCVerification />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
                    <Route path="/admin/transaction-tools" element={<TransactionToolsPage />} />
                    <Route path="/admin/test-tools" element={<TestToolsPage />} />
                  </Route>
                  
                  {/* Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
              <Toaster position="top-right" richColors />
            </NavbarContextProvider>
          </NotificationsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
