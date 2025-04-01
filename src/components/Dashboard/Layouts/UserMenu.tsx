
import React from 'react';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

interface UserMenuProps {
  email?: string | null;
  isAdmin?: boolean;
  isChecking?: boolean;
  handleLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ 
  email, 
  isAdmin = false,
  isChecking = false,
  handleLogout 
}) => {
  const getInitials = (email?: string | null) => {
    if (!email) return '??';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none">
          <Avatar className="h-8 w-8 bg-cbis-blue text-white">
            <AvatarImage src="" alt={email || 'User'} />
            <AvatarFallback>{getInitials(email)}</AvatarFallback>
          </Avatar>
          <div className="flex items-center">
            <span className="text-sm font-medium max-w-[150px] truncate text-gray-700 dark:text-gray-200">
              {email}
            </span>
            <ChevronDown className="h-4 w-4 ml-1 text-gray-500 dark:text-gray-400" />
          </div>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
        <DropdownMenuLabel className="text-gray-500 dark:text-gray-400">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        
        <Link to="/dashboard/profile">
          <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700">
            <User className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        
        <Link to="/dashboard/settings">
          <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700">
            <Settings className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
        >
          <LogOut className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
