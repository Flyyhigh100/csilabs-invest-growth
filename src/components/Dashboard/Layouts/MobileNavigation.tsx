
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Menu, X, LogOut, Loader2, ShieldCheck, Info, Home } from 'lucide-react';
import NotificationsMenu from './NotificationsMenu';
import { NavItem } from './DashboardNav';

interface MobileNavigationProps {
  email?: string | null;
  navItems: NavItem[];
  isAdmin: boolean;
  isChecking?: boolean;
  adminNavItem: NavItem | null;
  handleLogout: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  email,
  navItems,
  isAdmin,
  isChecking = false,
  adminNavItem,
  handleLogout,
  isOpen,
  onOpenChange
}) => {
  const getInitials = (email?: string | null) => {
    if (!email) return '??';
    return email.substring(0, 2).toUpperCase();
  };

  console.log("MobileNavigation props:", { email, isAdmin, isChecking });

  return (
    <div className="md:hidden flex items-center">
      <Link to="/" className="mr-2 text-gray-600 hover:text-cbis-blue">
        <Home className="h-5 w-5" />
      </Link>
      
      <div className="mr-2">
        <NotificationsMenu />
      </div>
      
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] sm:w-[350px] p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={email || "User"} />
                  <AvatarFallback>{getInitials(email)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{email}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="px-4 py-3 bg-blue-50">
              <div className="flex items-center gap-1.5 text-xs text-blue-700">
                <Info className="h-3 w-3" />
                <span>Main Navigation</span>
              </div>
            </div>
            
            <nav className="flex flex-col gap-1 py-2 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col px-3 py-2 rounded-md hover:bg-gray-100"
                  onClick={() => onOpenChange(false)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-cbis-blue">{item.icon || null}</div>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {item.description && (
                    <span className="text-xs text-gray-500 ml-8 mt-1">{item.description}</span>
                  )}
                </Link>
              ))}
              {isChecking ? (
                <div className="flex items-center gap-3 px-3 py-2 text-sm">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Checking admin status...
                </div>
              ) : isAdmin && adminNavItem && (
                <Link
                  to={adminNavItem.path}
                  className="flex flex-col px-3 py-2 rounded-md hover:bg-gray-100 bg-blue-50/80"
                  onClick={() => onOpenChange(false)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-cbis-blue">{adminNavItem.icon || null}</div>
                    <span className="font-medium text-cbis-blue">{adminNavItem.title}</span>
                  </div>
                  {adminNavItem.description && (
                    <span className="text-xs text-blue-600 ml-8 mt-1">{adminNavItem.description}</span>
                  )}
                </Link>
              )}
            </nav>
            <div className="mt-auto">
              <Separator className="mb-4" />
              <div className="px-4 pb-4">
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
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavigation;
