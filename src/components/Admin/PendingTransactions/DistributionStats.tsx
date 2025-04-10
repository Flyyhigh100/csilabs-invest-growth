
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PendingTransactionWithProfile } from '@/hooks/admin/usePendingTransactions';
import { getDistributionStats } from '@/utils/admin/exportUtils';
import { Wallet, Coins, Gauge } from 'lucide-react';

interface DistributionStatsProps {
  transactions: PendingTransactionWithProfile[];
}

const DistributionStats: React.FC<DistributionStatsProps> = ({ transactions }) => {
  const stats = getDistributionStats(transactions);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle>Distribution Details</CardTitle>
        <CardDescription>Summary of pending token distributions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-xl font-semibold">
                ${stats.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unique Wallets</p>
              <p className="text-xl font-semibold">
                {stats.uniqueWalletCount} 
                <span className="text-sm text-muted-foreground ml-1">of {stats.totalTransactions} distributions</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Gauge className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Est. Gas Savings</p>
              <p className="text-xl font-semibold">
                {stats.estimatedGasSavings.toFixed(3)} ETH
                {stats.transactionsSaved > 0 && (
                  <span className="text-sm text-green-600 ml-1">
                    ({stats.transactionsSaved} tx saved)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DistributionStats;
