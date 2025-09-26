import React, { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isUserAdmin } from '@/utils/admin';
import TopNavigation from './Layouts/TopNavigation';
import { getDashboardNavItems, getAdminNavItem, NavItem } from './Layouts/DashboardNav';
import { toast } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import Footer from '@/components/Footer';
import { Sparkles } from 'lucide-react';
interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}
const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title
}) => {
  const {
    user,
    signOut
  } = useAuth();
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
  console.log("Dashboard Layout state:", {
    isAdmin,
    isChecking,
    userId: user?.id
  });
  return <TooltipProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <TopNavigation email={user?.email} isAdmin={isAdmin} isChecking={isChecking} navItems={navItems} adminNavItem={adminNavItem} handleLogout={handleLogout} />

        {/* Main content */}
        <div className="flex-1 overflow-auto pt-16">
          <main className="py-4 md:py-6 px-4 md:px-6 lg:px-8">
            <div className="mb-4 md:mb-6">
              {title === "Buy Tokens" ? <div className="relative">
                  {/* Animated Background Container */}
                  <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500 p-6 md:p-8 rounded-2xl shadow-2xl animate-shimmer-bg animate-pulse-glow animate-fade-in-down overflow-hidden">
                    {/* Sparkle Icons */}
                    <Sparkles className="absolute top-2 right-2 h-5 w-5 text-yellow-300 animate-sparkle-twinkle" />
                    <Sparkles className="absolute bottom-2 left-2 h-4 w-4 text-yellow-200 animate-sparkle-twinkle animation-delay-500" />
                    <Sparkles className="absolute top-1/2 right-1/4 h-3 w-3 text-white animate-sparkle-twinkle animation-delay-1000" />
                    
                    {/* Animated Border */}
                    <div className="absolute inset-0 rounded-2xl animate-border-dance opacity-50"></div>
                    
                    {/* Title Content */}
                    <div className="relative z-10 animate-shimmer-text">
                      <div className="flex items-center justify-center mb-6">
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white text-center">Cannabis Science Digital Hub 
Tracking all your CBIS-EDP Assets</h1>
                      </div>
                      
                      <div className="space-y-2 text-left mb-4 max-w-2xl mx-auto">
                        <div className="flex items-start space-x-3">
                          <span className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">1</span>
                          <span className="font-medium text-sm md:text-base text-white">1-Million Strong Killing Cancers - CSi Labs Crypto Trading</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <span className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">2</span>
                          <span className="font-medium text-sm md:text-base text-white">Track your CBIS Shares to Trading</span>
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-2 max-w-2xl mx-auto">
                        <p className="text-sm md:text-base font-medium leading-relaxed text-white">
                          Welcome to the Free CSi-EDP Digital HUB Designed for you to communicate & track all your CSi-EDP Holdings & Grow with us!
                        </p>
                      </div>
                    </div>
                  </div>
                </div> : <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  {title}
                </h1>}
            </div>
            {children}
          </main>
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </TooltipProvider>;
};
export default DashboardLayout;