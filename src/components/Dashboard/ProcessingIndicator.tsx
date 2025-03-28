
import React from 'react';
import { Loader2 } from 'lucide-react';

const ProcessingIndicator: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-4">
      <Loader2 className="h-6 w-6 animate-spin text-cbis-blue mr-2" />
      <span>Processing payment request...</span>
    </div>
  );
};

export default ProcessingIndicator;
