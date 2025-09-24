import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLegacyAssets } from '@/hooks/useLegacyAssets';
import { useTransactions } from '@/hooks/transactions/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, Loader2 } from 'lucide-react';
import { formatTokenAmount } from '@/utils/format';

const GrandTotalCard: React.FC = () => {
  const { user } = useAuth();
  const { getTotalAssetCount, isLoading: legacyLoading } = useLegacyAssets();
  const { transactions, isLoading: txLoading } = useTransactions(user?.id);

  const isLoading = legacyLoading || txLoading;

  // Calculate total tokens delivered
  const deliveredTransactions = transactions?.filter(tx => tx.token_sent === true) || [];
  const totalTokens = deliveredTransactions.reduce((sum, tx) => {
    const tokenAmount = tx.token_amount || 
      (tx.token_price && tx.token_price > 0 ? tx.amount / tx.token_price : 0);
    return sum + Number(tokenAmount || 0);
  }, 0);

  // Get total legacy assets
  const totalLegacyAssets = getTotalAssetCount();

  // Calculate grand total
  const grandTotal = totalLegacyAssets + totalTokens;

  return (
    <Card className="mb-6 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Grand Total Holdings
        </CardTitle>
        <CardDescription>
          Combined value of all your CSI assets and tokens
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {formatTokenAmount(grandTotal)}
              </div>
              <div className="text-lg text-muted-foreground">
                Total CSI Units
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center space-y-1">
                <div className="text-sm text-muted-foreground">Legacy Assets</div>
                <div className="text-xl font-semibold text-amber-600">
                  {formatTokenAmount(totalLegacyAssets)}
                </div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-sm text-muted-foreground">CSI Tokens</div>
                <div className="text-xl font-semibold text-emerald-600">
                  {formatTokenAmount(totalTokens)}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GrandTotalCard;