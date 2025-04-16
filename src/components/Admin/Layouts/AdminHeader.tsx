
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  title: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title }) => {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-4 md:px-6 flex items-center justify-between fixed top-0 left-0 right-0 z-10 md:relative">
      <div className="flex items-center ml-12 md:ml-0">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center">
        <Button variant="outline" asChild size="sm" className="text-sm">
          <Link to="/dashboard" className="flex items-center gap-1 md:gap-2">
            <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
