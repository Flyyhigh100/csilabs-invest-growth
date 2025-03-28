
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

// List of admin email addresses
const ADMIN_EMAILS = ['ceo@example.com']; // Replace with your CEO's email

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cbis-blue"></div>
    </div>;
  }

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is an admin
  const isAdmin = user.email && ADMIN_EMAILS.includes(user.email);

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access this area. This section is restricted to administrators only.
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <p className="mt-4">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
