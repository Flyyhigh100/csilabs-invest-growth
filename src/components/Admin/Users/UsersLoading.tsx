
import React from 'react';
import { Loader2 } from 'lucide-react';

const UsersLoading: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-cbis-blue" />
      <span className="ml-2">Loading users...</span>
    </div>
  );
};

export default UsersLoading;
