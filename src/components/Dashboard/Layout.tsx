
import React, { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Home, 
  CreditCard, 
  FileText, 
  Bell, 
  ChevronDown, 
  UserCheck, 
  LayoutDashboard,
  Menu,
  X,
  DollarSign,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { isUserAdmin } from '@/utils/adminUtils';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdmin = async () => {
      const admin = await isUserAdmin();
      setIsAdmin(admin);
    };
    
    checkAdmin();
  }, []);
  
  const handleLogout = async () => {
    try {
      await signOut();
      // Navigation handled in auth context
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getInitials = (email?: string) => {
    if (!email) return '??';
    return email.substring(0, 2).toUpperCase();
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Buy Tokens', href: '/dashboard/payments', icon: <DollarSign className="h-5 w-5" /> },
    { name: 'KYC Verification', href: '/dashboard/kyc', icon: <UserCheck className="h-5 w-5" /> },
    { name: 'Transactions', href: '/dashboard/transactions', icon: <CreditCard className="h-5 w-5" /> },
    { name: 'Documents', href: '/dashboard/documents', icon: <FileText className="h-5 w-5" /> },
    { name: 'Profile', href: '/dashboard/profile', icon: <User className="h-5 w-5" /> },
  ];

  // Add Admin link for admin users
  const adminNavItem = { name: 'Admin Portal', href: '/admin', icon: <ShieldCheck className="h-5 w-5" /> };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top navigation */}
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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <div className="relative group">
                <button className="flex items-center gap-2 text-sm font-medium">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user?.email || "User"} />
                    <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                  </Avatar>
                  <span>{user?.email}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="py-1 divide-y divide-gray-100">
                    <div className="px-4 py-3">
                      <p className="text-sm">Signed in as</p>
                      <p className="text-sm font-medium truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/dashboard/profile" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100">
                        Profile settings
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100">
                          Admin Portal
                        </Link>
                      )}
                      <button 
                        onClick={handleLogout} 
                        className="text-gray-700 flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile menu button */}
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
                          <AvatarImage src="" alt={user?.email || "User"} />
                          <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user?.email}</span>
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
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
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
              
              {isAdmin && (
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

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
