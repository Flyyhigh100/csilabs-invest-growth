
import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isUserAdmin } from '@/utils/adminUtils';
import TopNavigation from './Layouts/TopNavigation';
import SidebarNavigation from './Layouts/SidebarNavigation';
import { getDashboardNavItems, getAdminNavItem } from './Layouts/DashboardNav';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  // Get navigation items
  const navItems = getDashboardNavItems();
  const adminNavItem = getAdminNavItem();
  
  useEffect(() => {
    const checkAdmin = async () => {
      setIsChecking(true);
      try {
        if (!user) {
          setIsAdmin(false);
          setIsChecking(false);
          return;
        }
        
        console.log("Starting admin status check for user:", user.id);
        const admin = await isUserAdmin();
        console.log("Admin status check completed:", admin);
        setIsAdmin(admin);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAdmin();
  }, [user]);
  
  const handleLogout = async () => {
    try {
      await signOut();
      // Navigation handled in auth context
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  console.log("Dashboard Layout state:", { isAdmin, isChecking, userId: user?.id });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNavigation 
        email={user?.email}
        isAdmin={isAdmin}
        isChecking={isChecking}
        navItems={navItems}
        adminNavItem={adminNavItem}
        handleLogout={handleLogout}
      />

      <div className="flex flex-1">
        <SidebarNavigation 
          navItems={navItems}
          isAdmin={isAdmin}
          isChecking={isChecking}
          adminNavItem={adminNavItem}
          handleLogout={handleLogout}
        />

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
