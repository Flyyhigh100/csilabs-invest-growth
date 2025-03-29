
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isUserAdmin } from '@/utils/adminUtils';
import { useAuth } from '@/contexts/AuthContext';
import AdminHeader from './Layouts/AdminHeader';
import AdminSidebar from './Layouts/AdminSidebar';
import { getAdminNavItems } from './Layouts/AdminNav';

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
      const admin = await isUserAdmin();
      setIsAdmin(admin);
      setIsChecking(false);
      
      if (!admin) {
        navigate('/dashboard');
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
    return null; // Will redirect in useEffect
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
