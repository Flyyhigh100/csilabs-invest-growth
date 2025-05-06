
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuIcon, X, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserMenu from './UserMenu';
import NotificationsMenu from './NotificationsMenu';
import { NavItem } from './DashboardNav';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface TopNavigationProps {
  email: string | undefined | null;
  isAdmin: boolean;
  isChecking: boolean;
  navItems: NavItem[];
  adminNavItem: NavItem | null;
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
  const location = useLocation();
  
  return (
    <>
      {/* Fixed header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-40 h-16">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Logo and mobile menu trigger */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <MenuIcon className="h-6 w-6" />
            </Button>
            
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold text-primary">CSI Token</span>
            </Link>
          </div>
          
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 h-full">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`
                    h-full flex items-center px-4 text-sm font-medium border-b-2 transition-colors
                    ${isActive 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'}
                  `}
                >
                  {item.title}
                </Link>
              );
            })}
            
            {(isAdmin || email === 'chris.d.conley@gmail.com') && adminNavItem && (
              <Link
                to={adminNavItem.href}
                className={`
                  h-full flex items-center px-4 text-sm font-medium border-b-2 transition-colors
                  ${location.pathname.startsWith('/admin') 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'}
                `}
              >
                {adminNavItem.title}
              </Link>
            )}
          </nav>
          
          {/* User section - notifications and profile */}
          <div className="flex items-center space-x-1">
            <NotificationsMenu />
            <UserMenu 
              email={email} 
              isAdmin={isAdmin} 
              isChecking={isChecking} 
              handleLogout={handleLogout} 
            />
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation Drawer */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[280px]">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold text-primary">CSI Token</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`
                      flex items-center gap-3 p-3 rounded-md text-sm font-medium
                      ${isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {React.createElement(item.icon, { className: "h-5 w-5" })}
                    <span>{item.title}</span>
                  </Link>
                );
              })}
              
              {(isAdmin || email === 'chris.d.conley@gmail.com') && adminNavItem && (
                <Link
                  to={adminNavItem.href}
                  className={`
                    flex items-center gap-3 p-3 rounded-md text-sm font-medium
                    ${location.pathname.startsWith('/admin') 
                      ? 'bg-blue-50 text-primary' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {React.createElement(adminNavItem.icon, { className: "h-5 w-5" })}
                  <span>{adminNavItem.title}</span>
                </Link>
              )}
            </nav>
            
            <div className="p-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                Sign out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default TopNavigation;
