
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Menu, X, LogOut, Loader2, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface MobileNavigationProps {
  email?: string | null;
  navItems: NavItem[];
  isAdmin: boolean;
  isChecking?: boolean;
  adminNavItem: NavItem;
  handleLogout: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  email,
  navItems,
  isAdmin,
  isChecking = false,
  adminNavItem,
  handleLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { theme } = useTheme();
  
  const getInitials = (email?: string | null) => {
    if (!email) return '??';
    return email.substring(0, 2).toUpperCase();
  };

  console.log("MobileNavigation props:", { email, isAdmin, isChecking });

  return (
    <div className="md:hidden">
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] sm:w-[350px] p-0 bg-white dark:bg-gray-800">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 bg-cbis-blue text-white">
                  <AvatarImage src="" alt={email || "User"} />
                  <AvatarFallback>{getInitials(email)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate max-w-[180px]">{email}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Menu</h2>
            </div>
            <nav className="flex flex-col gap-1 px-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-cbis-blue dark:hover:text-blue-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-gray-500 dark:text-gray-400">
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
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md bg-blue-50 dark:bg-blue-900/30 text-cbis-blue dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-cbis-blue dark:text-blue-300">
                    {adminNavItem.icon}
                  </span>
                  <span className="font-semibold">{adminNavItem.name}</span>
                </Link>
              )}
            </nav>
            <div className="mt-auto p-4">
              <Separator className="mb-4 bg-gray-200 dark:bg-gray-700" />
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span>Sign out</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavigation;
