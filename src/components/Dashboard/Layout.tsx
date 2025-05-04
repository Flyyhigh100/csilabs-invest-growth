
import React, { ReactNode } from 'react';
import TopNavigation from './Layouts/TopNavigation';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Navigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title = "Dashboard" }) => {
  const user = useUser();
  const supabase = useSupabaseClient();
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  const navItems = [
    { title: 'Dashboard', path: '/' },
    { title: 'Transactions', path: '/transactions' },
    { title: 'Research Documents', path: '/research-documents' }
  ];

  const adminNavItem = { title: 'Admin Portal', path: '/admin' };

  return (
    <div className="flex min-h-screen flex-col">
      <TopNavigation 
        email={user?.email}
        isAdmin={false}
        isChecking={false}
        navItems={navItems}
        adminNavItem={adminNavItem}
        handleLogout={handleLogout}
      />
      
      <div className="container mx-auto p-4 flex-1">
        {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
