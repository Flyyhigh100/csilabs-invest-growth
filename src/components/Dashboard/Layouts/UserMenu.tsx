
import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface UserMenuProps {
  email?: string | null;
  isAdmin: boolean;
  handleLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ email, isAdmin, handleLogout }) => {
  const getInitials = (email?: string | null) => {
    if (!email) return '??';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 text-sm font-medium">
        <Avatar className="h-8 w-8">
          <AvatarImage src="" alt={email || "User"} />
          <AvatarFallback>{getInitials(email)}</AvatarFallback>
        </Avatar>
        <span>{email}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        <div className="py-1 divide-y divide-gray-100">
          <div className="px-4 py-3">
            <p className="text-sm">Signed in as</p>
            <p className="text-sm font-medium truncate">{email}</p>
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
  );
};

export default UserMenu;
