
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  RefreshCw, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  Activity,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWalletPortfolioSummary, useRefreshWalletBalances } from '@/hooks/admin/useWalletBalances';
import { formatDistanceToNow } from 'date-fns';

const WalletPortfolioCard: React.FC = () => {
  const { data: portfolio, isLoading } = useWalletPortfolioSummary();
  const refreshBalances = useRefreshWalletBalances();

  if (isLoading) {
    return (
      <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Enhanced Wallet Portfolio</CardTitle>
          <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="animate-pulse">
              <div className="h-8 bg-blue-200 rounded mb-2"></div>
              <div className="h-4 bg-blue-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!portfolio) {
    return (
      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-700">Enhanced Wallet Portfolio</CardTitle>
          <Wallet className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-amber-700 mb-2">No wallet data available</p>
            <p className="text-xs text-amber-600 mb-3">
              Fetch balances using enhanced Moralis API with accurate pricing
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshBalances.mutate()}
              disabled={refreshBalances.isPending}
              className="border-amber-300 hover:bg-amber-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshBalances.isPending ? 'animate-spin' : ''}`} />
              Fetch Live Balances
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topCurrencies = Object.entries(portfolio.balances_by_currency)
    .sort(([,a], [,b]) => b.balance_usd - a.balance_usd)
    .slice(0, 4);

  const stablecoins = topCurrencies.filter(([currency]) => 
    ['USDT', 'USDC', 'BUSD', 'DAI'].includes(currency)
  );
  
  const nativeTokens = topCurrencies.filter(([currency]) => 
    ['BTC', 'ETH', 'BNB', 'SOL', 'POL', 'MATIC'].includes(currency)
  );

  return (
    <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-green-700">Enhanced Portfolio</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refreshBalances.mutate()}
            disabled={refreshBalances.isPending}
            title="Refresh using enhanced Moralis API"
            className="hover:bg-green-100"
          >
            <RefreshCw className={`h-4 w-4 ${refreshBalances.isPending ? 'animate-spin' : ''}`} />
          </Button>
          <Wallet className="h-4 w-4 text-green-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Enhanced Total Value Display */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 p-4">
            <div className="absolute inset-0 bg-white/20"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-700" />
                  <span className="text-sm font-medium text-green-700">Total Value</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600">Live</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-700 mt-1">
                ${portfolio.total_usd_value.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Enhanced Network Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-700">Networks</span>
              </div>
              <div className="text-lg font-bold text-green-800">5</div>
              <div className="text-xs text-green-600">Blockchains</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-700">Assets</span>
              </div>
              <div className="text-lg font-bold text-green-800">
                {Object.keys(portfolio.balances_by_currency).length}
              </div>
              <div className="text-xs text-green-600">Currencies</div>
            </div>
          </div>

          {/* Enhanced Stablecoins Section */}
          {stablecoins.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Stablecoins</span>
              </div>
              <div className="space-y-2">
                {stablecoins.map(([currency, data]) => (
                  <div key={currency} className="flex items-center justify-between p-2 bg-white/40 rounded border border-green-200">
                    <Badge variant="outline" className="font-mono text-green-700 border-green-300 bg-green-50">
                      {currency}
                    </Badge>
                    <div className="text-right">
                      <div className="font-semibold text-green-800">${data.balance_usd.toFixed(2)}</div>
                      <div className="text-xs text-green-600">
                        {data.balance.toFixed(2)} {currency}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Native Tokens Section */}
          {nativeTokens.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-700">Native Tokens</span>
              </div>
              <div className="space-y-2">
                {nativeTokens.slice(0, 3).map(([currency, data]) => (
                  <div key={currency} className="flex items-center justify-between p-2 bg-white/40 rounded border border-blue-200">
                    <Badge variant="outline" className="font-mono text-blue-700 border-blue-300 bg-blue-50">
                      {currency}
                    </Badge>
                    <div className="text-right">
                      <div className="font-semibold text-blue-800">${data.balance_usd.toFixed(2)}</div>
                      <div className="text-xs text-blue-600">
                        {data.balance.toFixed(6)} {currency}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Last Updated */}
          {portfolio.last_updated && (
            <div className="text-xs text-green-600 text-center pt-2 border-t border-green-200">
              <div className="flex items-center justify-center gap-1">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                <span>Updated {formatDistanceToNow(new Date(portfolio.last_updated), { addSuffix: true })}</span>
              </div>
            </div>
          )}

          {/* Enhanced View Details Button */}
          <Button asChild variant="outline" className="w-full border-green-300 hover:bg-green-100 group" size="sm">
            <Link to="/admin/wallet-portfolio" className="flex items-center justify-center gap-2">
              <span>View Enhanced Portfolio</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletPortfolioCard;
