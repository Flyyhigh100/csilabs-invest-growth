
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
  AlertTriangle,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/contexts/ThemeContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
    <div className={`flex min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-gray-50 dark:bg-gray-900`}>
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col fixed h-full">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 pt-5 pb-4 overflow-y-auto border-r border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <Link to="/" className="flex items-center">
              <ShieldCheck className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-xl text-blue-600 dark:text-blue-400">Admin Portal</span>
            </Link>
          </div>
          <ScrollArea className="flex-1 px-3">
            <nav className="flex-1 space-y-1">
              {adminRoutes.map((route) => (
                <Link
                  key={route.path}
                  to={route.path}
                  className={`group rounded-md px-3 py-2.5 flex items-center text-sm font-medium transition-colors ${
                    pathname === route.path
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className={`mr-3 ${
                    pathname === route.path ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-700 dark:group-hover:text-blue-300'
                  }`}>
                    {route.icon}
                  </span>
                  {route.name}
                  {pathname === route.path && (
                    <ChevronRight className="ml-auto h-4 w-4 text-blue-700 dark:text-blue-300" />
                  )}
                </Link>
              ))}
            </nav>
          </ScrollArea>
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-3 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-full justify-start text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {theme === 'dark' ? 
                <Sun className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" /> : 
                <Moon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
              }
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
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
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
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
