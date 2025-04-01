
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HelpCircle, Home, Users, FileText, CreditCard, ShieldCheck, Book } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, text, isActive }) => (
  <Link
    to={href}
    className={cn(
      "flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors",
      isActive 
        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-100" 
        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    )}
  >
    {icon}
    {text}
  </Link>
);

const AdminNav: React.FC = () => {
  const { pathname } = useLocation();
  
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  
  return (
    <nav className="space-y-1 w-full">
      <NavItem 
        href="/admin" 
        icon={<Home className="w-4 h-4" />} 
        text="Dashboard" 
        isActive={isActive('/admin') && pathname === '/admin'} 
      />
      <NavItem 
        href="/admin/kyc-verifications" 
        icon={<ShieldCheck className="w-4 h-4" />} 
        text="KYC Verifications" 
        isActive={isActive('/admin/kyc-verifications')} 
      />
      <NavItem 
        href="/admin/transactions" 
        icon={<CreditCard className="w-4 h-4" />} 
        text="Transactions" 
        isActive={isActive('/admin/transactions')} 
      />
      <NavItem 
        href="/admin/users" 
        icon={<Users className="w-4 h-4" />} 
        text="Users" 
        isActive={isActive('/admin/users')} 
      />
      <NavItem 
        href="/admin/high-value-approvals" 
        icon={<FileText className="w-4 h-4" />} 
        text="High Value Approvals" 
        isActive={isActive('/admin/high-value-approvals')} 
      />
      <NavItem 
        href="/admin/research" 
        icon={<Book className="w-4 h-4" />} 
        text="Research Documents" 
        isActive={isActive('/admin/research')} 
      />
      <div className="py-3">
        <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
      </div>
      <a 
        href="https://docs.csilabs.io/admin" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
      >
        <HelpCircle className="w-4 h-4" />
        Help & Documentation
      </a>
    </nav>
  );
};

export default AdminNav;
