
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
// Import Admin pages from Admin directory
import AdminTransactions from "./pages/Admin/Transactions";
import AdminUsers from "./pages/Admin/Users";
import AdminKYCVerifications from "./pages/Admin/KYCVerifications";
import AdminSettings from "./pages/Admin/Settings";
import AdminResearchDocuments from "./pages/Admin/ResearchDocuments";
import AdminTokenPricing from "./pages/Admin/TokenPricing";
import AdminSystemFlow from "./pages/Admin/SystemFlow";
import AdminIPNLogs from "./pages/Admin/IPNLogs";
import AdminNotifications from "./pages/Admin/Notifications";
import CoinPaymentsSetup from "./pages/CoinPaymentsSetup";
// Use the paths that match your file structure for these test pages
import TestIPNWebhook from "./pages/Admin/TestIPNWebhook"; 
import TestIPNForm from "./pages/Admin/TestIPNForm";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useHydrate } from 'react-query/hydration';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { MoralisProvider } from "react-moralis";
import { polygonMumbai } from "@wagmi/chains";
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { mainnet, goerli } from 'wagmi/chains';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from "@/components/Dashboard/Layout";
import TestToolsPage from './pages/Admin/TestTools';

// Create a TopNavigation component here since it appears to be missing
import TopNavigation from '@/components/Dashboard/Layouts/TopNavigation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

const projectId = process.env.NEXT_PUBLIC_WEB3MODAL_PROJECT_ID || "";

const { chains, publicClient } = configureChains(
  [
    mainnet,
    goerli,
    polygonMumbai
  ],
  [
    w3mProvider({ projectId }),
    publicProvider()
  ]
);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  publicClient
});

const ethereumClient = new EthereumClient(wagmiConfig, chains);

function App() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [hydrated, setHydrated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    // Check if the current user is an admin
    async function checkAdminStatus() {
      if (user) {
        // Check if user exists in the admins table
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (data && !error) {
          setIsAdmin(true);
        }
        
        setIsChecking(false);
      } else {
        setIsAdmin(false);
        setIsChecking(false);
      }
    }
    
    checkAdminStatus();
  }, [user, supabase]);

  // Fix the hydration issue by providing a proper function
  const hydratedState = useHydrate(queryClient);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const localStorageData = localStorage.getItem('react-query');
    if (!localStorageData) {
      // Fix the dehydrate method access
      localStorage.setItem('react-query', JSON.stringify(queryClient.getQueryCache().getAll()));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Navigate to home page after logout
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { title: 'Dashboard', path: '/' },
    { title: 'Transactions', path: '/transactions' },
    { title: 'Research Documents', path: '/research-documents' }
  ];

  const adminNavItem = { title: 'Admin Portal', path: '/admin' };

  const AdminRoute = () => {
    return user ? (
      user.email?.includes("@cbis.network") ? (
        <DashboardLayout title="Admin Dashboard">
          <TopNavigation 
            email={user?.email}
            isAdmin={isAdmin}
            isChecking={isChecking}
            navItems={navItems}
            adminNavItem={adminNavItem}
            handleLogout={handleLogout}
          />
        </DashboardLayout>
      ) : (
        <Navigate to="/" />
      )
    ) : (
      <Navigate to="/login" />
    );
  };

  const AuthRoute = () => {
    return user ? (
      <Navigate to="/" />
    ) : (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="p-8 bg-white shadow-md rounded-lg w-96">
          <h1 className="text-2xl font-semibold mb-4 text-center">Authentication</h1>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google', 'github']}
            redirectTo={`${window.location.origin}`}
          />
        </div>
      </div>
    );
  };

  if (!hydrated) {
    return null;
  }

  return (
    <MoralisProvider initializeOnMount={false} apiKey={process.env.NEXT_PUBLIC_MORALIS_API_KEY}>
      <WagmiConfig config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<AuthRoute />} />
              <Route path="/register" element={<AuthRoute />} />
              <Route path="/coinpayments-setup" element={<CoinPaymentsSetup />} />
              <Route path="/test-ipn-webhook" element={<TestIPNWebhook />} />
              <Route path="/test-ipn-form" element={<TestIPNForm />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route path="" element={<Dashboard />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="kyc-verifications" element={<AdminKYCVerifications />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="research-documents" element={<AdminResearchDocuments />} />
                <Route path="token-pricing" element={<AdminTokenPricing />} />
                <Route path="system-flow" element={<AdminSystemFlow />} />
                <Route path="ipn-logs" element={<AdminIPNLogs />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="test-tools" element={<TestToolsPage />} />
              </Route>
            </Routes>
          </Router>
          <ReactQueryDevtools initialIsOpen={false} />
          <Toaster />
          <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
        </QueryClientProvider>
      </WagmiConfig>
    </MoralisProvider>
  );
}

export default App;
