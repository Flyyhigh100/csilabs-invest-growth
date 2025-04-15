
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  SettingsIcon,
  BellIcon
} from 'lucide-react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Sidebar = ({ className, ...props }: SidebarProps) => {
  const links = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: <HomeIcon className="w-4 h-4 mr-3" />,
    },
    {
      title: 'KYC Verification',
      href: '/admin/kyc',
      icon: <ShieldCheckIcon className="w-4 h-4 mr-3" />,
    },
    {
      title: 'Users',
      href: '/admin/users',
      icon: <UsersIcon className="w-4 h-4 mr-3" />,
    },
    {
      title: 'Token Distribution',
      href: '/admin/transactions',
      icon: <CreditCardIcon className="w-4 h-4 mr-3" />,
    },
    {
      title: 'Notifications',
      href: '/admin/notifications',
      icon: <BellIcon className="w-4 h-4 mr-3" />,
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: <SettingsIcon className="w-4 h-4 mr-3" />,
    },
  ];

  return (
    <nav
      className={cn("flex flex-col space-y-1 p-2 h-full", className)}
      {...props}
    >
      {links.map((link) => (
        <NavLink
          key={link.href}
          to={link.href}
          className={({ isActive }) =>
            cn(
              "flex items-center px-4 py-3 text-sm rounded-lg transition",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-gray-600 hover:text-primary hover:bg-primary/5"
            )
          }
        >
          {link.icon}
          {link.title}
        </NavLink>
      ))}
    </nav>
  );
};

export default Sidebar;
