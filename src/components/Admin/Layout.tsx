
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  LayoutGrid, 
  Users, 
  FileCheck, 
  LogOut, 
  ShieldCheck,
  DollarSign,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const adminRoutes = [
    { path: '/admin', name: 'Dashboard', icon: <LayoutGrid className="h-5 w-5" /> },
    { path: '/admin/users', name: 'User Management', icon: <Users className="h-5 w-5" /> },
    { path: '/admin/kyc-verifications', name: 'KYC Verifications', icon: <FileCheck className="h-5 w-5" /> },
    { path: '/admin/transactions', name: 'Token Distribution', icon: <DollarSign className="h-5 w-5" /> },
    { path: '/admin/high-value-approvals', name: 'High-Value Approvals', icon: <AlertTriangle className="h-5 w-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col fixed h-full">
        <div className="flex flex-col flex-grow bg-white pt-5 pb-4 overflow-y-auto border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <span className="font-semibold text-xl flex items-center text-blue-600">
              <ShieldCheck className="h-6 w-6 mr-2" />
              Admin Portal
            </span>
          </div>
          <ScrollArea className="flex-1 px-3">
            <nav className="flex-1 space-y-1">
              {adminRoutes.map((route) => (
                <Link
                  key={route.path}
                  to={route.path}
                  className={`group rounded-md px-3 py-2 flex items-center text-sm font-medium ${
                    pathname === route.path
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className={`mr-3 ${
                    pathname === route.path ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'
                  }`}>
                    {route.icon}
                  </span>
                  {route.name}
                  {pathname === route.path && (
                    <ChevronRight className="ml-auto h-4 w-4 text-blue-700" />
                  )}
                </Link>
              ))}
            </nav>
          </ScrollArea>
          <div className="flex-shrink-0 border-t border-gray-200 p-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3 text-gray-500" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
