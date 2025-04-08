
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserMenu from './UserMenu';
import MobileNavigation from './MobileNavigation';
import NotificationsMenu from './NotificationsMenu';
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
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-cbis-blue">CSi Labs</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-cbis-blue">
              <Home className="h-5 w-5" />
            </Link>
            
            <NotificationsMenu />
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
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
