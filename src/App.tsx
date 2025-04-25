
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import ResearchDocuments from "./pages/ResearchDocuments";
import TokenInfo from "./pages/TokenInfo";

// Admin routes
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminUsers from "./pages/Admin/Users";
import AdminTransactions from "./pages/Admin/Transactions";
import AdminKYCVerifications from "./pages/Admin/KYCVerifications";
import AdminResearchDocuments from "./pages/Admin/ResearchDocuments";
import AdminNotifications from "./pages/Admin/Notifications";
import AdminSettings from "./pages/Admin/Settings";
import AdminTestTools from "./pages/Admin/TestTools";
import AdminIPNLogs from "./pages/Admin/IPNLogs";
import AdminSystemFlow from "./pages/Admin/SystemFlow";
import AdminTransactionTools from "./pages/Admin/TransactionTools";
import TokenPricing from "./pages/Admin/TokenPricing";

// Dashboard routes
import DashboardHome from "./pages/Dashboard/DashboardHome";
import Profile from "./pages/Dashboard/Profile";
import Transactions from "./pages/Dashboard/Transactions";
import KYCVerificationPage from "./pages/Dashboard/KYCVerification";
import Documents from "./pages/Dashboard/Documents";
import Payments from "./pages/Dashboard/Payments";

// Legal routes
import TermsAndConditions from "./pages/Legal/TermsAndConditions";
import TokenDisclaimer from "./pages/Legal/TokenDisclaimer";
import GeographicRestrictions from "./pages/Legal/GeographicRestrictions";
import FoundationDisclosure from "./pages/Legal/FoundationDisclosure";

import { TokenPriceProvider } from './context/TokenPriceContext';
import { AuthProvider } from "./contexts/AuthContext";

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <TokenPriceProvider>
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/token-info" element={<TokenInfo />} />
                <Route path="/research-documents" element={<ResearchDocuments />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Legal Routes */}
                <Route path="/legal/terms" element={<TermsAndConditions />} />
                <Route path="/legal/token-disclaimer" element={<TokenDisclaimer />} />
                <Route path="/legal/geographic-restrictions" element={<GeographicRestrictions />} />
                <Route path="/legal/foundation-disclosure" element={<FoundationDisclosure />} />
                
                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
                  <Route index element={<DashboardHome />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="kyc-verification" element={<KYCVerificationPage />} />
                  <Route path="documents" element={<Documents />} />
                  <Route path="payments" element={<Payments />} />
                </Route>
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin/transactions" element={<AdminRoute><AdminTransactions /></AdminRoute>} />
                <Route path="/admin/kyc-verifications" element={<AdminRoute><AdminKYCVerifications /></AdminRoute>} />
                <Route path="/admin/research-documents" element={<AdminRoute><AdminResearchDocuments /></AdminRoute>} />
                <Route path="/admin/notifications" element={<AdminRoute><AdminNotifications /></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
                <Route path="/admin/test-tools" element={<AdminRoute><AdminTestTools /></AdminRoute>} />
                <Route path="/admin/ipn-logs" element={<AdminRoute><AdminIPNLogs /></AdminRoute>} />
                <Route path="/admin/system-flow" element={<AdminRoute><AdminSystemFlow /></AdminRoute>} />
                <Route path="/admin/transaction-tools" element={<AdminRoute><AdminTransactionTools /></AdminRoute>} />
                <Route path="/admin/token-pricing" element={<AdminRoute><TokenPricing /></AdminRoute>} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <Toaster />
          </AuthProvider>
        </TokenPriceProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
