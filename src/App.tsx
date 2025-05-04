import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Users from "./pages/Users";
import KYCVerifications from "./pages/KYCVerifications";
import Settings from "./pages/Settings";
import ResearchDocuments from "./pages/ResearchDocuments";
import TokenPricing from "./pages/TokenPricing";
import SystemFlow from "./pages/SystemFlow";
import IPNLogs from "./pages/IPNLogs";
import Notifications from "./pages/Notifications";
import CoinPaymentsSetup from "./pages/CoinPaymentsSetup";
import TestIPNWebhook from "./pages/TestIPNWebhook";
import TestIPNForm from "./pages/TestIPNForm";
import TopNavigation from '@/components/Dashboard/Layouts/TopNavigation';
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useHydrate } from 'react-query/hydration';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { MoralisProvider } from "react-moralis";
import { polygonMumbai } from "@wagmi/chains";
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { mainnet, goerli } from 'wagmi/chains'

// Make sure TestToolsPage is imported at the top with other imports
import TestToolsPage from './pages/Admin/TestTools';

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
)

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  publicClient
})

const ethereumClient = new EthereumClient(wagmiConfig, chains)

function App() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useHydrate(queryClient, () => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const localStorageData = localStorage.getItem('react-query');
    return localStorageData ? JSON.parse(localStorageData) : undefined;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const localStorageData = localStorage.getItem('react-query');
    if (!localStorageData) {
      localStorage.setItem('react-query', JSON.stringify(queryClient. dehydrate()));
    }
  }, []);

  const AdminRoute = () => {
    return user ? (
      user.email?.includes("@cbis.network") ? (
        <TopNavigation />
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
                <Route path="transactions" element={<Transactions />} />
                <Route path="users" element={<Users />} />
                <Route path="kyc-verifications" element={<KYCVerifications />} />
                <Route path="settings" element={<Settings />} />
                <Route path="research-documents" element={<ResearchDocuments />} />
                <Route path="token-pricing" element={<TokenPricing />} />
                <Route path="system-flow" element={<SystemFlow />} />
                <Route path="ipn-logs" element={<IPNLogs />} />
                <Route path="notifications" element={<Notifications />} />
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
