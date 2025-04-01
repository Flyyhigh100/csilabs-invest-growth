
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Menu, X, LogOut, Loader2, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarNavigationProps {
  navItems: NavItem[];
  isAdmin: boolean;
  isChecking?: boolean;
  adminNavItem: NavItem;
  handleLogout: () => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ 
  navItems, 
  isAdmin, 
  isChecking = false,
  adminNavItem, 
  handleLogout 
}) => {
  console.log("SidebarNavigation props:", { isAdmin, isChecking });
  const { theme } = useTheme();
  
  return (
    <div className="hidden md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex flex-col h-full">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Main Menu</h2>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-cbis-blue dark:hover:text-blue-400 transition-colors"
            >
              <span className="text-gray-500 dark:text-gray-400 group-hover:text-cbis-blue dark:group-hover:text-blue-400">
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          ))}
          
          {isChecking ? (
            <div className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md bg-gray-50 dark:bg-gray-700 animate-pulse">
              <Loader2 className="h-5 w-5 animate-spin text-cbis-blue dark:text-blue-400" />
              <span>Checking admin status...</span>
            </div>
          ) : isAdmin && (
            <Link
              to={adminNavItem.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md bg-blue-50 dark:bg-blue-900/30 text-cbis-blue dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <span className="text-cbis-blue dark:text-blue-300">
                {adminNavItem.icon}
              </span>
              <span className="font-semibold">{adminNavItem.name}</span>
            </Link>
          )}
        </nav>
        <div className="p-4 mt-auto">
          <Separator className="my-2 bg-gray-200 dark:bg-gray-700" />
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2 mt-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span>Sign out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SidebarNavigation;
