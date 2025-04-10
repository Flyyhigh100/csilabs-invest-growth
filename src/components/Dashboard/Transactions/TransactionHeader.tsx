
import React from 'react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { RefreshCw } from "lucide-react";

interface TransactionHeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

const TransactionHeader: React.FC<TransactionHeaderProps> = ({ 
  isRefreshing, 
  onRefresh 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <CardTitle className="text-lg">Transaction History</CardTitle>
        <CardDescription>Your payment and token purchase history</CardDescription>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
        <Button asChild variant="outline">
          <Link to="/dashboard/payments">Make a Purchase</Link>
        </Button>
      </div>
    </div>
  );
};

export default TransactionHeader;
