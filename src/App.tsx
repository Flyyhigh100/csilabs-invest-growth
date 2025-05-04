
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

// Create a simplified version of the app without web3 integrations for now
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

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
        <div className="p-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p>Admin functionality coming soon</p>
        </div>
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
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<AuthRoute />} />
          <Route path="/register" element={<AuthRoute />} />
          <Route path="/admin" element={<AdminRoute />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
