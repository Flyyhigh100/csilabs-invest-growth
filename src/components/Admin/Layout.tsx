
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Inbox, Users, LogOut, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path 
      ? "bg-cbis-blue text-white" 
      : "text-gray-600 hover:bg-gray-100";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-cbis-blue">Admin Portal</h1>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                <Link 
                  to="/admin" 
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive('/admin')}`}
                >
                  <Home className="mr-3 h-5 w-5" />
                  Dashboard
                </Link>
                <Link 
                  to="/admin/transactions" 
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive('/admin/transactions')}`}
                >
                  <CreditCard className="mr-3 h-5 w-5" />
                  Transactions
                </Link>
                <Link 
                  to="/admin/users" 
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive('/admin/users')}`}
                >
                  <Users className="mr-3 h-5 w-5" />
                  Users
                </Link>
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button
                    onClick={() => signOut()}
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navbar */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200">
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <Link 
                to="/dashboard" 
                className="px-3 py-1 text-sm text-cbis-blue hover:bg-cbis-blue hover:text-white border border-cbis-blue rounded-md transition-colors"
              >
                Return to User Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
