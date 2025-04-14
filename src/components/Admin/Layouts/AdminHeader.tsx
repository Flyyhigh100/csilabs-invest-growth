
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  title: string;
  onToggleSidebar?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, onToggleSidebar }) => {
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 lg:py-4 lg:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onToggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-lg lg:text-xl font-bold text-gray-900">Admin Portal</h1>
      </div>
      
      <div className="flex items-center">
        <Button variant="outline" size="sm" asChild className="text-xs lg:text-sm">
          <Link to="/dashboard" className="flex items-center gap-1 lg:gap-2">
            <ChevronLeft className="h-3 w-3 lg:h-4 lg:w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
