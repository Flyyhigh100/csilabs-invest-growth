
import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // You can add a loading spinner here
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
              Please log in to access the dashboard.
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

  return <>{children}</>;
};

export default ProtectedRoute;
