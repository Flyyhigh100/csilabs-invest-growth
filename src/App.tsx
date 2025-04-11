
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import { NavbarContextProvider } from './contexts/NavbarContext';

// Import components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import GlobalLoading from './components/GlobalLoading';

// Import pages
import NotFound from './pages/NotFound';
import TestToolsPage from './pages/Admin/TestTools';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {/* Move Router component before AuthProvider */}
        <Router>
          <AuthProvider>
            <NavbarContextProvider>
              <GlobalLoading />
              <Routes>
                {/* Public Routes - Using dummy placeholders for now */}
                <Route path="/" element={<div>Home Page</div>} />
                <Route path="/login" element={<div>Login Page</div>} />
                <Route path="/register" element={<div>Register Page</div>} />
                <Route path="/reset-password" element={<div>Reset Password Page</div>} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<div>Dashboard</div>} />
                  <Route path="/dashboard/kyc" element={<div>KYC</div>} />
                  <Route path="/dashboard/transactions" element={<div>Transactions</div>} />
                  <Route path="/dashboard/profile" element={<div>Profile</div>} />
                  <Route path="/dashboard/settings" element={<div>Settings</div>} />
                  <Route path="/dashboard/wallet" element={<div>Wallet</div>} />
                </Route>
                
                {/* Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<div>Admin Dashboard</div>} />
                  <Route path="/admin/kyc" element={<div>Admin KYC Verification</div>} />
                  <Route path="/admin/users" element={<div>Admin Users</div>} />
                  <Route path="/admin/transactions" element={<div>Admin Transactions</div>} />
                  <Route path="/admin/transaction-tools" element={<div>Transaction Tools</div>} />
                  <Route path="/admin/test-tools" element={<TestToolsPage />} />
                </Route>
                
                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster position="top-right" richColors />
            </NavbarContextProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
