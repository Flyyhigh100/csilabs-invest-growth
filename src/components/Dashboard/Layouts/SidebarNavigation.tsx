
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Menu, X, LogOut, Loader2, ShieldCheck } from 'lucide-react';

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
  
  return (
    <div className="hidden md:block w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        <div className="p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase">Main Menu</h2>
        </div>
        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="group flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 hover:text-cbis-blue"
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
          
          {isChecking ? (
            <div className="flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md">
              <Loader2 className="h-5 w-5 animate-spin" />
              Checking admin status...
            </div>
          ) : isAdmin && (
            <Link
              to={adminNavItem.href}
              className="group flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md bg-blue-50 text-cbis-blue hover:bg-blue-100"
            >
              {adminNavItem.icon}
              {adminNavItem.name}
            </Link>
          )}
        </nav>
        <div className="border-t border-gray-200 p-4">
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SidebarNavigation;
