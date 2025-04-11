
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const TransactionLoadingState = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="w-full h-[60px]" />
      <Skeleton className="w-full h-[60px]" />
      <Skeleton className="w-full h-[60px]" />
    </div>
  );
};

export default TransactionLoadingState;
