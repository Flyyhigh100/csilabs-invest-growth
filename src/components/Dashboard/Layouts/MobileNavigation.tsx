
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Menu, X, LogOut } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface MobileNavigationProps {
  email?: string | null;
  navItems: NavItem[];
  isAdmin: boolean;
  adminNavItem: NavItem;
  handleLogout: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  email,
  navItems,
  isAdmin,
  adminNavItem,
  handleLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  const getInitials = (email?: string | null) => {
    if (!email) return '??';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="md:hidden">
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] sm:w-[350px]">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between py-4">
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
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Separator />
            <nav className="flex flex-col gap-1 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to={adminNavItem.href}
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 text-cbis-blue font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {adminNavItem.icon}
                  {adminNavItem.name}
                </Link>
              )}
            </nav>
            <div className="mt-auto">
              <Separator className="mb-4" />
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
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavigation;
