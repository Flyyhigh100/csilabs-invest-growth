
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, CreditCard, ShieldCheck, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isUserAdmin } from '@/utils/adminUtils';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

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
  
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { path: '/admin/kyc', label: 'KYC Verifications', icon: <ShieldCheck className="h-5 w-5" /> },
    { path: '/admin/transactions', label: 'Transactions', icon: <CreditCard className="h-5 w-5" /> },
    { path: '/admin/users', label: 'Users', icon: <Users className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link to="/dashboard" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === item.path
                    ? 'bg-cbis-blue text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

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
