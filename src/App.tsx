
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import Index from "./pages/Index";
import TokenInfo from "./pages/TokenInfo";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Auth pages
import Login from "./pages/Auth/Login";
import RegisterAuth from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";

// Dashboard pages
import DashboardHome from "./pages/Dashboard/DashboardHome";
import KYCVerification from "./pages/Dashboard/KYCVerification";

// Create a new QueryClient instance inside the component to ensure it's created in the React component tree
const App = () => {
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/token-info" element={<TokenInfo />} />
            <Route path="/register" element={<Register />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<RegisterAuth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/dashboard/kyc" element={<KYCVerification />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
