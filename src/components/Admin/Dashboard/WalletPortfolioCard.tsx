
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, RefreshCw, TrendingUp, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWalletPortfolioSummary, useRefreshWalletBalances } from '@/hooks/admin/useWalletBalances';
import { formatDistanceToNow } from 'date-fns';

const WalletPortfolioCard: React.FC = () => {
  const { data: portfolio, isLoading } = useWalletPortfolioSummary();
  const refreshBalances = useRefreshWalletBalances();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Wallet Portfolio</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!portfolio) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Wallet Portfolio</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            <p>No wallet data available</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshBalances.mutate()}
              disabled={refreshBalances.isPending}
              className="mt-2"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshBalances.isPending ? 'animate-spin' : ''}`} />
              Fetch Balances
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topCurrencies = Object.entries(portfolio.balances_by_currency)
    .sort(([,a], [,b]) => b.balance_usd - a.balance_usd)
    .slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Wallet Portfolio</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refreshBalances.mutate()}
            disabled={refreshBalances.isPending}
          >
            <RefreshCw className={`h-4 w-4 ${refreshBalances.isPending ? 'animate-spin' : ''}`} />
          </Button>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Total Value */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Value</span>
            </div>
            <span className="text-2xl font-bold">
              ${portfolio.total_usd_value.toFixed(2)}
            </span>
          </div>

          {/* Top Currencies */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Top Holdings</span>
            </div>
            <div className="space-y-1">
              {topCurrencies.map(([currency, data]) => (
                <div key={currency} className="flex items-center justify-between text-sm">
                  <Badge variant="outline" className="font-mono">
                    {currency}
                  </Badge>
                  <div className="text-right">
                    <div className="font-medium">${data.balance_usd.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">
                      {data.balance.toFixed(6)} {currency}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Last Updated */}
          {portfolio.last_updated && (
            <div className="text-xs text-gray-500 text-center pt-2 border-t">
              Updated {formatDistanceToNow(new Date(portfolio.last_updated), { addSuffix: true })}
            </div>
          )}

          {/* View Details Button */}
          <Button asChild variant="outline" className="w-full" size="sm">
            <Link to="/admin/wallet-portfolio">
              View Detailed Portfolio
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletPortfolioCard;
