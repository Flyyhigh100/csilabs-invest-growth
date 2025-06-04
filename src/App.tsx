
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import { NavbarContextProvider } from './contexts/NavbarContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import ErrorBoundary from './components/ErrorBoundary';
import TokenPricingPage from './pages/Admin/TokenPricing';
import TransactionAnalyticsPage from './pages/Admin/TransactionAnalytics';

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
import MagicLinkVerification from './pages/Auth/MagicLinkVerification';
import NotFound from './pages/NotFound';
import Payments from './pages/Dashboard/Payments';
import Transactions from './pages/Dashboard/Transactions';
import ResearchDocuments from './pages/ResearchDocuments';
import TokenInfo from './pages/TokenInfo';
import ContactUs from './pages/ContactUs';
import KYCVerificationPage from './pages/Dashboard/KYCVerification/KYCVerificationPage';
import Profile from './pages/Dashboard/Profile';
import Documents from './pages/Dashboard/Documents';
import DashboardHome from './pages/Dashboard/DashboardHome';

// Import Legal pages
import TermsOfService from './pages/Legal/TermsAndConditions';
import FoundationDisclosure from './pages/Legal/FoundationDisclosure';
import GeographicRestrictions from './pages/Legal/GeographicRestrictions';
import TokenDisclaimer from './pages/Legal/TokenDisclaimer';

// Import Admin pages explicitly
import AdminDashboard from './pages/Admin/Dashboard';
import AdminTransactionsPage from './pages/Admin/Transactions';
import AdminUsersPage from './pages/Admin/Users';
import AdminKycPage from './pages/Admin/KYCVerifications';
import AdminSettingsPage from './pages/Admin/Settings';
import AdminNotificationsPage from './pages/Admin/Notifications';
import AdminTransactionToolsPage from './pages/Admin/TransactionTools';
import AdminResearchDocuments from './pages/Admin/ResearchDocuments';
import AdminWalletPortfolioPage from './pages/Admin/WalletPortfolio';
import SystemFlowPage from './pages/Admin/SystemFlow';
import CoinPaymentsSetupPage from './pages/Admin/CoinPaymentsSetup';
import TransactionStatusManagerPage from './pages/Admin/TransactionStatusManager';

const queryClient = new QueryClient();

export default function App() {
  console.log('🚀 App component rendering...');
  
  return (
    <ErrorBoundary>
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
                    {/* Add redirect from /signup to /register */}
                    <Route path="/signup" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route 
                      path="/auth/magic-link" 
                      element={
                        <ErrorBoundary fallback={
                          <div className="min-h-screen flex items-center justify-center">
                            <div className="text-center">
                              <h1 className="text-2xl font-bold text-red-600 mb-4">Magic Link Error</h1>
                              <p className="text-gray-600 mb-4">There was an error loading the magic link verification page.</p>
                              <button 
                                onClick={() => window.location.href = '/login'}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Go to Login
                              </button>
                            </div>
                          </div>
                        }>
                          <MagicLinkVerification />
                        </ErrorBoundary>
                      } 
                    />
                    <Route path="/research-documents" element={<ResearchDocuments />} />
                    <Route path="/token-info" element={<TokenInfo />} />
                    <Route path="/contact" element={<ContactUs />} />
                    
                    {/* Legal Routes */}
                    <Route path="/legal/terms-and-conditions" element={<TermsOfService />} />
                    <Route path="/legal/foundation-disclosure" element={<FoundationDisclosure />} />
                    <Route path="/legal/geographic-restrictions" element={<GeographicRestrictions />} />
                    <Route path="/legal/token-disclaimer" element={<TokenDisclaimer />} />
                    
                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/dashboard" element={<DashboardHome />} />
                      <Route path="/dashboard/kyc" element={<KYCVerificationPage />} />
                      <Route path="/dashboard/transactions" element={<Transactions />} />
                      <Route path="/dashboard/profile" element={<Profile />} />
                      <Route path="/dashboard/documents" element={<Documents />} />
                      <Route path="/dashboard/wallet" element={<div>Wallet</div>} />
                      <Route path="/dashboard/payments" element={<Payments />} />
                    </Route>
                    
                    {/* Admin Routes */}
                    <Route element={<AdminRoute />}>
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/system-flow" element={<SystemFlowPage />} />
                      <Route path="/admin/kyc" element={<AdminKycPage />} />
                      <Route path="/admin/users" element={<AdminUsersPage />} />
                      <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
                      <Route path="/admin/wallet-portfolio" element={<AdminWalletPortfolioPage />} />
                      <Route path="/admin/transaction-status" element={<TransactionStatusManagerPage />} />
                      <Route path="/admin/transaction-analytics" element={<TransactionAnalyticsPage />} />
                      <Route path="/admin/transaction-tools" element={<AdminTransactionToolsPage />} />
                      <Route path="/admin/settings" element={<AdminSettingsPage />} />
                      <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
                      <Route path="/admin/research-documents" element={<AdminResearchDocuments />} />
                      <Route path="/admin/token-pricing" element={<TokenPricingPage />} />
                      <Route path="/admin/coinpayments-setup" element={<CoinPaymentsSetupPage />} />
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
    </ErrorBoundary>
  );
}
