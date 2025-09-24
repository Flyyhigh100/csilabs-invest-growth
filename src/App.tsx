import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { SecurityProvider } from './contexts/SecurityContext';
import { Toaster } from 'sonner';
import { NavbarContextProvider } from './contexts/NavbarContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ChartEngineProvider } from '@/lib/charts/ChartEngineProvider';
import ErrorBoundary from './components/ErrorBoundary';
import RouteTest from './components/RouteTest';
import TokenPricingPage from './pages/Admin/TokenPricing';
import TransactionAnalyticsPage from './pages/Admin/TransactionAnalytics';
import ReportsPage from './pages/Admin/Reports';
import CompletedTransactionsPage from './pages/Admin/CompletedTransactions';
import VolumeDetailsPage from './pages/Admin/VolumeDetails';

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
import Resources from './pages/Dashboard/Resources';

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
import AdminLegacyAssets from './pages/Admin/LegacyAssets';
import SystemFlowPage from './pages/Admin/SystemFlow';
import CoinPaymentsSetupPage from './pages/Admin/CoinPaymentsSetup';
import TransactionStatusManagerPage from './pages/Admin/TransactionStatusManager';
import AdministratorsPage from './pages/Admin/Administrators';
import AdminCommunications from './pages/Admin/Communications';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TooltipProvider>
          <ChartEngineProvider>
            <SecurityProvider>
              <AuthProvider>
                <NavbarContextProvider>
                  <Router>
                  <ErrorBoundary>
                    <div className="min-h-screen bg-white">
                      <GlobalLoading />
                      <Toaster position="top-right" richColors />
                      
                      <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/magic-link-verification" element={<MagicLinkVerification />} />
                        <Route path="/research-documents" element={<ResearchDocuments />} />
                        <Route path="/token-info" element={<TokenInfo />} />
                        <Route path="/contact" element={<ContactUs />} />
                        
                        {/* Legal pages */}
                        <Route path="/legal/terms" element={<TermsOfService />} />
                        <Route path="/legal/foundation-disclosure" element={<FoundationDisclosure />} />
                        <Route path="/legal/geographic-restrictions" element={<GeographicRestrictions />} />
                        <Route path="/legal/token-disclaimer" element={<TokenDisclaimer />} />
                        
                        {/* Protected routes */}
                        <Route path="/dashboard" element={<ProtectedRoute />}>
                          <Route index element={<DashboardHome />} />
                          <Route path="home" element={<DashboardHome />} />
                          <Route path="payments" element={<Payments />} />
                          <Route path="transactions" element={<Transactions />} />
                          <Route path="resources" element={<Resources />} />
                          <Route path="kyc" element={<KYCVerificationPage />} />
                          <Route path="profile" element={<Profile />} />
                          <Route path="documents" element={<Documents />} />
                        </Route>
                        
                        {/* Admin routes */}
                        <Route path="/admin" element={<AdminRoute />}>
                          <Route index element={<AdminDashboard />} />
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="communications" element={<AdminCommunications />} />
                          <Route path="reports" element={<ReportsPage />} />
                          <Route path="transactions" element={<AdminTransactionsPage />} />
                          <Route path="transactions/completed" element={<CompletedTransactionsPage />} />
                          <Route path="transactions/volume-details" element={<VolumeDetailsPage />} />
                          <Route path="users" element={<AdminUsersPage />} />
                          <Route path="admins" element={<AdministratorsPage />} />
                          <Route path="kyc" element={<AdminKycPage />} />
                          <Route path="settings" element={<AdminSettingsPage />} />
                          <Route path="notifications" element={<AdminNotificationsPage />} />
                          <Route path="transaction-tools" element={<AdminTransactionToolsPage />} />
                          <Route path="research-documents" element={<AdminResearchDocuments />} />
                          <Route path="wallet-portfolio" element={<AdminWalletPortfolioPage />} />
                          <Route path="legacy-assets" element={<AdminLegacyAssets />} />
                          <Route path="system-flow" element={<SystemFlowPage />} />
                          <Route path="coinpayments-setup" element={<CoinPaymentsSetupPage />} />
                          <Route path="transaction-status" element={<TransactionStatusManagerPage />} />
                          <Route path="token-pricing" element={<TokenPricingPage />} />
                          <Route path="analytics" element={<TransactionAnalyticsPage />} />
                        </Route>
                        
                        {/* Test route */}
                        <Route path="/route-test" element={<RouteTest />} />
                        
                        {/* Catch all route */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                  </ErrorBoundary>
                </Router>
              </NavbarContextProvider>
            </AuthProvider>
          </SecurityProvider>
        </ChartEngineProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
