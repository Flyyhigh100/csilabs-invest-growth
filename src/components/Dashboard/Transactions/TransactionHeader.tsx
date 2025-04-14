
import React from 'react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface TransactionHeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

const TransactionHeader: React.FC<TransactionHeaderProps> = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <CardTitle className="text-lg">Transaction History</CardTitle>
        <CardDescription>Your payment and token purchase history</CardDescription>
      </div>
      <div>
        <Button asChild variant="outline">
          <Link to="/dashboard/payments">Make a Purchase</Link>
        </Button>
      </div>
    </div>
  );
};

export default TransactionHeader;
