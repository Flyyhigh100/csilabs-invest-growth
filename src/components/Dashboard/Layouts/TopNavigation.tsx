
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MenuIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MobileNavigation from './MobileNavigation';
import UserMenu from './UserMenu';
import NotificationsMenu from './NotificationsMenu';

interface TopNavigationProps {
  email: string | undefined | null;
  isAdmin: boolean;
  isChecking: boolean;
  navItems: { title: string; path: string }[];
  adminNavItem: { title: string; path: string } | null;
  handleLogout: () => void;
}

const TopNavigation = ({ 
  email, 
  isAdmin, 
  isChecking,
  navItems, 
  adminNavItem,
  handleLogout 
}: TopNavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="py-3 px-4 flex items-center justify-between">
        {/* Logo and mobile menu trigger */}
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden" 
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
          
          <Link to="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-primary">CSI Token</span>
          </Link>
        </div>
        
        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                px-3 py-2 text-sm font-medium rounded-md
                ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
              `}
            >
              {item.title}
            </NavLink>
          ))}
          
          {(isAdmin || email === 'chris.d.conley@gmail.com') && adminNavItem && (
            <NavLink
              to={adminNavItem.path}
              className={({ isActive }) => `
                px-3 py-2 text-sm font-medium rounded-md
                ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
              `}
            >
              {adminNavItem.title}
            </NavLink>
          )}
        </nav>
        
        {/* User section - notifications and profile */}
        <div className="flex items-center space-x-1">
          <NotificationsMenu />
          <UserMenu email={email} isAdmin={isAdmin} isChecking={isChecking} handleLogout={handleLogout} />
        </div>
      </div>
      
      {/* Mobile Navigation Drawer */}
      <MobileNavigation 
        isOpen={isMobileMenuOpen} 
        onOpenChange={setIsMobileMenuOpen}
        navItems={navItems}
        isAdmin={isAdmin}
        isChecking={isChecking}
        adminNavItem={adminNavItem}
        email={email}
        handleLogout={handleLogout}
      />
    </header>
  );
};

export default TopNavigation;
