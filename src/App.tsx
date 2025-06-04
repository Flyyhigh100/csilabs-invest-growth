import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { CSRFProvider } from "@/components/Security/CSRFProtection";
import SessionManager from "@/components/Security/SessionManager";
import { NavbarProvider } from "@/contexts/NavbarContext";
import { TokenPriceProvider } from "@/context/TokenPriceContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import GlobalLoading from "@/components/GlobalLoading";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import ProfilePage from "@/pages/Dashboard/Profile";
import TransactionsPage from "@/pages/Dashboard/Transactions";
import KYCPage from "@/pages/Dashboard/KYC";
import AdminDashboard from "@/pages/Admin/Dashboard";
import AdminUsers from "@/pages/Admin/Users";
import AdminTransactions from "@/pages/Admin/Transactions";
import AdminKYC from "@/pages/Admin/KYC";
import AdminDocuments from "@/pages/Admin/Documents";
import AdminSettings from "@/pages/Admin/Settings";
import AdminTransactionTools from "@/pages/Admin/TransactionTools";
import Register from "@/pages/Auth/Register";
import Login from "@/pages/Auth/Login";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import ResetPassword from "@/pages/Auth/ResetPassword";
import Logout from "@/pages/Auth/Logout";
import Documents from "@/pages/Documents";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SecurityProvider>
            <AuthProvider>
              <CSRFProvider>
                <SessionManager timeoutMinutes={30} warningMinutes={5}>
                  <NavbarProvider>
                    <TokenPriceProvider>
                      <BrowserRouter>
                        <div className="min-h-screen bg-background font-sans antialiased">
                          <GlobalLoading />
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/transactions" element={<TransactionsPage />} />
                            <Route path="/kyc" element={<KYCPage />} />
                            
                            {/* Admin Routes */}
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/admin/users" element={<AdminUsers />} />
                            <Route path="/admin/transactions" element={<AdminTransactions />} />
                            <Route path="/admin/kyc" element={<AdminKYC />} />
                            <Route path="/admin/documents" element={<AdminDocuments />} />
                            <Route path="/admin/settings" element={<AdminSettings />} />
                            <Route path="/admin/transaction-tools" element={<AdminTransactionTools />} />
                            
                            {/* Auth Routes */}
                            <Route path="/register" element={<Register />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/logout" element={<Logout />} />
                            
                            {/* Document Route */}
                            <Route path="/documents" element={<Documents />} />
                            
                            {/* Not Found Route */}
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </div>
                        <Toaster />
                      </BrowserRouter>
                    </TokenPriceProvider>
                  </NavbarProvider>
                </SessionManager>
              </CSRFProvider>
            </AuthProvider>
          </SecurityProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
