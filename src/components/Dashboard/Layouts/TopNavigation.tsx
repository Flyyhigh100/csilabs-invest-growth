
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItem {
  title: string;
  path: string;
}

export interface TopNavigationProps {
  email?: string | null;
  isAdmin: boolean;
  isChecking: boolean;
  navItems: NavItem[];
  adminNavItem: NavItem;
  handleLogout: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ 
  email, 
  isAdmin, 
  isChecking, 
  navItems, 
  adminNavItem, 
  handleLogout 
}) => {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="text-xl font-bold">CSi Token Platform</Link>
        </div>
        
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="pt-6 space-y-4">
              <Link to="/" className="text-xl font-bold block mb-6">CSi Token Platform</Link>
              {navItems.map((item) => (
                <Link 
                  key={item.title} 
                  to={item.path}
                  className="block py-2 text-base hover:text-primary"
                >
                  {item.title}
                </Link>
              ))}
              {isAdmin && !isChecking && (
                <Link 
                  to={adminNavItem.path}
                  className="block py-2 text-base font-semibold text-blue-600 hover:text-blue-800"
                >
                  {adminNavItem.title}
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Desktop Navigation */}
        <nav className="mx-6 hidden md:flex items-center space-x-4 lg:space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.title}
              to={item.path}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.title}
            </Link>
          ))}
        </nav>
        
        <div className="ml-auto flex items-center space-x-4">
          {email && (
            <span className="hidden md:inline text-sm text-muted-foreground">
              {email}
            </span>
          )}
          
          {isAdmin && !isChecking && (
            <Link 
              to={adminNavItem.path}
              className="hidden md:block text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {adminNavItem.title}
            </Link>
          )}
          
          {email && (
            <Button variant="outline" onClick={handleLogout}>
              Log out
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;
