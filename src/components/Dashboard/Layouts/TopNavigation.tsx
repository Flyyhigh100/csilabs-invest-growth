
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Bell, ShieldCheck, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserMenu from './UserMenu';
import MobileNavigation from './MobileNavigation';
import { useTheme } from '@/contexts/ThemeContext';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface TopNavigationProps {
  email?: string | null;
  isAdmin: boolean;
  isChecking?: boolean;
  navItems: NavItem[];
  adminNavItem: NavItem;
  handleLogout: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  email,
  isAdmin,
  isChecking = false,
  navItems,
  adminNavItem,
  handleLogout
}) => {
  console.log("TopNavigation props:", { isAdmin, isChecking, email });
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent">CSi Labs</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Link to="/" className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-cbis-blue dark:hover:text-blue-400 transition-colors">
              <Home className="h-5 w-5" />
            </Link>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-cbis-blue dark:hover:text-blue-400 transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-sm font-medium text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
            
            <UserMenu email={email} isAdmin={isAdmin} isChecking={isChecking} handleLogout={handleLogout} />
          </div>
          
          {/* Mobile menu button */}
          <MobileNavigation 
            email={email}
            navItems={navItems}
            isAdmin={isAdmin}
            isChecking={isChecking}
            adminNavItem={adminNavItem}
            handleLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
