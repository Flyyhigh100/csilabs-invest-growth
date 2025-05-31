
import React, { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isUserAdmin } from '@/utils/admin';
import TopNavigation from './Layouts/TopNavigation';
import { getDashboardNavItems, getAdminNavItem, NavItem } from './Layouts/DashboardNav';
import { toast } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import Footer from '@/components/Footer';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  // Get navigation items
  const navItems: NavItem[] = getDashboardNavItems();
  const adminNavItem: NavItem = getAdminNavItem();
  
  useEffect(() => {
    const checkAdmin = async () => {
      setIsChecking(true);
      try {
        if (!user) {
          setIsAdmin(false);
          setIsChecking(false);
          return;
        }
        
        // Special case for chris.d.conley@gmail.com
        if (user.email === 'chris.d.conley@gmail.com') {
          console.log("Chris's email detected, granting admin access directly");
          setIsAdmin(true);
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
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <TopNavigation 
          email={user?.email}
          isAdmin={isAdmin}
          isChecking={isChecking}
          navItems={navItems}
          adminNavItem={adminNavItem}
          handleLogout={handleLogout}
        />

        {/* Main content */}
        <div className="flex-1 overflow-auto pt-16">
          <main className="py-4 md:py-6 px-4 md:px-6 lg:px-8">
            <div className="mb-4 md:mb-6">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {title === "Buy Tokens" ? "Limited Time Pre-Launch Special! Buy Direct @ Current Spot Price" : title}
              </h1>
            </div>
            {children}
          </main>
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default DashboardLayout;
