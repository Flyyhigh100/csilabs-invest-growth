
import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <span className="ml-2 text-gray-600">Loading...</span>
    </div>
  );
};

export default Loading;
