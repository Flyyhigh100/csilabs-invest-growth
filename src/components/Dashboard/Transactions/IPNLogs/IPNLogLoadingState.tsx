
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const IPNLogLoadingState: React.FC = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="w-full h-[40px]" />
      <Skeleton className="w-full h-[300px]" />
    </div>
  );
};

export default IPNLogLoadingState;
