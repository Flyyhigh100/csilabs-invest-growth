
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, ShieldCheck } from 'lucide-react';
import { isUserAdmin } from '@/utils/adminUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(adminOnly);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user && adminOnly) {
        try {
          console.log("Checking admin status in ProtectedRoute for:", user.email);
          const admin = await isUserAdmin();
          console.log("Admin check result in ProtectedRoute:", admin);
          setIsAdmin(admin);
        } catch (error) {
          console.error("Error checking admin status in ProtectedRoute:", error);
        } finally {
          setIsChecking(false);
        }
      } else if (!adminOnly) {
        setIsChecking(false);
      }
    };
    
    checkAdminStatus();
  }, [user, adminOnly]);

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
