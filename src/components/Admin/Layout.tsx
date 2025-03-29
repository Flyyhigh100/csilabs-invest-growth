
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isUserAdmin } from '@/utils/adminUtils';
import { useAuth } from '@/contexts/AuthContext';
import AdminHeader from './Layouts/AdminHeader';
import AdminSidebar from './Layouts/AdminSidebar';
import { getAdminNavItems } from './Layouts/AdminNav';
import { toast } from 'sonner';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  
  // Get navigation items
  const navItems = getAdminNavItems();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      try {
        console.log("Checking admin status for user ID:", user.id);
        const admin = await isUserAdmin();
        console.log("Admin check result:", admin);
        setIsAdmin(admin);
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast.error("Failed to verify admin permissions");
      } finally {
        setIsChecking(false);
      }
    };
    
    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading, navigate]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cbis-blue"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md text-center">
          <div className="flex justify-center">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">
            You do not have admin privileges to access this section.
          </p>
          <div className="pt-4">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader title="Admin Portal" />

      <div className="flex flex-1">
        <AdminSidebar navItems={navItems} />

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
