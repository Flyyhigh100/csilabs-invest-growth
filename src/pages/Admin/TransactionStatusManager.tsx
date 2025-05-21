
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import TransactionStatusDashboard from '@/components/Admin/TransactionStatusManager/TransactionStatusDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { TooltipProvider } from '@/components/ui/tooltip';

const TransactionStatusManagerPage: React.FC = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase.rpc('is_admin');
          
        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          return;
        }
        
        setIsAdmin(!!data);
      } catch (err) {
        console.error('Exception checking admin status:', err);
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [user]);

  // Add loading state
  if (isAdmin === null) {
    return (
      <AdminLayout title="Transaction Status Manager">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Checking admin permissions...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Redirect if not admin
  if (isAdmin === false) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <TooltipProvider>
      <AdminLayout title="Transaction Status Manager">
        <TransactionStatusDashboard />
      </AdminLayout>
    </TooltipProvider>
  );
};

export default TransactionStatusManagerPage;
