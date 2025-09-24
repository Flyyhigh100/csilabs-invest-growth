import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLegacyAssets } from '@/hooks/useLegacyAssets';
import { useTransactions } from '@/hooks/transactions/useTransactions';
import { useLegacyAssetTransactions } from '@/hooks/useLegacyAssetTransactions';
import { useCurrentPrice } from '@/hooks/token/useCurrentPrice';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, Loader2, DollarSign } from 'lucide-react';
import { formatTokenAmount, formatCurrency } from '@/utils/format';
import { LEGACY_ASSET_TYPES } from '@/hooks/useLegacyAssets';

const GrandTotalCard: React.FC = () => {
  const { user } = useAuth();
  const { getTotalAssetCount, isLoading: legacyLoading } = useLegacyAssets();
  const { transactions, isLoading: txLoading } = useTransactions(user?.id);
  const { data: currentPrice, isLoading: isPriceLoading } = useCurrentPrice();

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

  // Calculate legacy assets dollar value using cost basis from all asset types
  const legacyAssetTransactions = {
    'CBIS Original Shares': useLegacyAssetTransactions('CBIS Original Shares'),
    'CBIS-GIFT Shares': useLegacyAssetTransactions('CBIS-GIFT Shares'),
    'CBIS-First Rights Shares (ENDO)': useLegacyAssetTransactions('CBIS-First Rights Shares (ENDO)'),
    'CSi-VIP Shares': useLegacyAssetTransactions('CSi-VIP Shares'),
    'CSi-VIP Award Shares': useLegacyAssetTransactions('CSi-VIP Award Shares'),
    'CSi-Management/Partner Shares': useLegacyAssetTransactions('CSi-Management/Partner Shares')
  };

  const legacyAssetValue = LEGACY_ASSET_TYPES.reduce((total, assetType) => {
    const { getAverageCostBasis, getTotalShares } = legacyAssetTransactions[assetType];
    const shares = getTotalShares(assetType);
    const avgCost = getAverageCostBasis(assetType);
    return total + (shares * avgCost);
  }, 0);

  // Calculate CSI token dollar value
  const tokenValue = currentPrice ? totalTokens * currentPrice : 0;

  // Calculate grand totals
  const grandTotal = totalLegacyAssets + totalTokens;
  const grandTotalValue = legacyAssetValue + tokenValue;

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
          <div className="space-y-6">
            {/* Grand Total Display */}
            <div className="text-center p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-lg border border-primary/30">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-lg text-muted-foreground">
                  <DollarSign className="h-5 w-5" />
                  <span>Total Portfolio Value</span>
                </div>
                <div className="text-5xl font-bold text-primary">
                  {isPriceLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  ) : grandTotalValue > 0 ? (
                    formatCurrency(grandTotalValue)
                  ) : (
                    <span className="text-3xl text-muted-foreground">Value calculating...</span>
                  )}
                </div>
                <div className="text-lg text-muted-foreground">
                  {formatTokenAmount(grandTotal)} Total CSI Units
                </div>
              </div>
            </div>
            
            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="space-y-2">
                  <div className="text-sm text-amber-700 dark:text-amber-300 font-medium">Legacy Assets</div>
                  <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {formatTokenAmount(totalLegacyAssets)}
                  </div>
                  <div className="text-sm text-amber-600 dark:text-amber-400">
                    {legacyAssetValue > 0 ? formatCurrency(legacyAssetValue) : 'No transactions'}
                  </div>
                </div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="space-y-2">
                  <div className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">CSI Tokens</div>
                  <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                    {formatTokenAmount(totalTokens)}
                  </div>
                  <div className="text-sm text-emerald-600 dark:text-emerald-400">
                    {isPriceLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                    ) : currentPrice && tokenValue > 0 ? (
                      formatCurrency(tokenValue)
                    ) : (
                      'Price loading...'
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {currentPrice && (
              <div className="text-center text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
                <p>Current CSI token price: {formatCurrency(currentPrice)} • Legacy assets valued at cost basis</p>
                <p className="mt-1">Values update automatically with market prices</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GrandTotalCard;