
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, ShieldCheck } from 'lucide-react';
import { isUserAdmin } from '@/utils/adminUtils';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(adminOnly);
  const [attempts, setAttempts] = useState<number>(0);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user && adminOnly) {
        try {
          console.log("Checking admin status in ProtectedRoute for:", user.email);
          
          // Add a small delay to ensure connection is ready
          setTimeout(async () => {
            try {
              // For specific test account, force admin access
              if (user.email === 'chris.d.conley@gmail.com') {
                console.log("Test account detected, granting admin access directly");
                setIsAdmin(true);
                setIsChecking(false);
                return;
              }
              
              const admin = await isUserAdmin();
              console.log("Admin check result in ProtectedRoute:", admin);
              setIsAdmin(admin);
            } catch (error) {
              console.error("Error in delayed admin check:", error);
              
              // If this is the first few attempts, try again
              if (attempts < 3) {
                setAttempts(prev => prev + 1);
                console.log(`Retrying admin check attempt ${attempts + 1}/3`);
                setTimeout(() => checkAdminStatus(), 500); // Retry after 500ms
              } else {
                console.error("Failed admin check after multiple attempts");
                setIsAdmin(false);
              }
            } finally {
              setIsChecking(false);
            }
          }, 200);
        } catch (error) {
          console.error("Error checking admin status in ProtectedRoute:", error);
          setIsAdmin(false);
          setIsChecking(false);
        }
      } else if (!adminOnly) {
        setIsChecking(false);
      }
    };
    
    checkAdminStatus();
  }, [user, adminOnly, attempts]);

  // Special case for chris.d.conley@gmail.com on admin routes
  useEffect(() => {
    if (user?.email === 'chris.d.conley@gmail.com' && adminOnly && location.pathname.includes('/admin')) {
      console.log("Chris's account detected on admin route, granting immediate access");
      setIsAdmin(true);
      setIsChecking(false);
    }
  }, [user, adminOnly, location]);

  if (loading || (adminOnly && isChecking)) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cbis-blue"></div>
    </div>;
  }

  if (!user) {
    // Show a message and redirect link instead of immediate redirect
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Authentication Required</h2>
            <p className="mt-2 text-gray-600">
              {location.pathname.includes('/admin') 
                ? "Please log in to access the admin area."
                : "Please log in to access the dashboard."}
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <Button asChild className="bg-gradient-to-r from-cbis-blue to-cbis-teal text-white">
              <Link to="/login" state={{ from: location }}>
                Log in
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex items-center justify-center gap-2">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Special check for chris.d.conley@gmail.com
  if (adminOnly && user.email === 'chris.d.conley@gmail.com') {
    console.log("Allowing admin access for chris.d.conley@gmail.com");
    return <>{children}</>;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md text-center">
          <div className="flex justify-center">
            <div className="bg-red-100 p-3 rounded-full">
              <ShieldCheck className="h-10 w-10 text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">
            Your account ({user.email}) does not have admin privileges to access this section.
          </p>
          <div className="pt-4">
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
