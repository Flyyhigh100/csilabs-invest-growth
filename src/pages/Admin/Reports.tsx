
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import AnalyticsHub from '@/components/Admin/Analytics';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { TooltipProvider } from '@/components/ui/tooltip';

const ReportsPage: React.FC = () => {
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

  if (isAdmin === null) {
    return (
      <AdminLayout title="Reports">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading reports...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isAdmin === false) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <TooltipProvider>
      <AdminLayout title="Analytics & Reports">
        <AnalyticsHub />
      </AdminLayout>
    </TooltipProvider>
  );
};

export default ReportsPage;
