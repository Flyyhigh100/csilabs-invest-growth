
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Activity,
  Globe,
  Database
} from 'lucide-react';
import { useEnhancedCryptoPrices } from '@/hooks/admin/useEnhancedCryptoPrices';
import { formatDistanceToNow } from 'date-fns';

const EnhancedMarketPricesCard: React.FC = () => {
  const { data: prices, isLoading, error, dataUpdatedAt, refetch, isFetching } = useEnhancedCryptoPrices();

  if (isLoading) {
    return (
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse text-blue-600" />
            Live Market Prices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <AlertTriangle className="h-5 w-5" />
            Market Prices - CoinGecko Connection Issue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-orange-600 text-sm mb-4">
              Unable to fetch live prices from CoinGecko. Using fallback data.
            </p>
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              size="sm"
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Retry CoinGecko
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prices) return null;

  // Separate live and fallback prices
  const livePrices = Object.values(prices).filter(p => p.source === 'coingecko');
  const fallbackPrices = Object.values(prices).filter(p => p.source === 'fallback');

  return (
    <Card className="border-2 border-green-100 shadow-lg bg-gradient-to-br from-white to-green-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-600" />
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Live Market Prices
            </span>
            <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
              CoinGecko API
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => refetch()}
              variant="ghost"
              size="sm"
              disabled={isFetching}
              className="hover:bg-green-100"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              {dataUpdatedAt && formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}
            </div>
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Real-time cryptocurrency prices from CoinGecko • Auto-refreshes every 30 seconds
        </p>
      </CardHeader>
      <CardContent>
        {/* Live Prices Section */}
        {livePrices.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Live Prices</span>
              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                {livePrices.length} live
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {livePrices.map((price) => (
                <div 
                  key={price.symbol} 
                  className="group relative overflow-hidden p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-bold text-lg">{price.symbol}</div>
                        <div className="text-xs text-gray-500 truncate">{price.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">
                          ${price.price.toLocaleString(undefined, { 
                            minimumFractionDigits: price.price > 1 ? 2 : 6,
                            maximumFractionDigits: price.price > 1 ? 2 : 6 
                          })}
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          {price.change24h >= 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          )}
                          <Badge 
                            variant={price.change24h >= 0 ? "default" : "destructive"}
                            className="text-xs px-1 py-0"
                          >
                            {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end">
                      <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-600">
                        <Globe className="h-2 w-2 mr-1" />
                        Live
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback Prices Section */}
        {fallbackPrices.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Estimated Prices</span>
              <Badge variant="outline" className="text-xs bg-amber-50 border-amber-200 text-amber-600">
                {fallbackPrices.length} estimated
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {fallbackPrices.map((price) => (
                <div 
                  key={price.symbol} 
                  className="p-4 bg-amber-50 rounded-lg border border-amber-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{price.symbol}</div>
                      <div className="text-xs text-amber-600">{price.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ${price.price.toLocaleString(undefined, { 
                          minimumFractionDigits: price.price > 1 ? 2 : 6,
                          maximumFractionDigits: price.price > 1 ? 2 : 6 
                        })}
                      </div>
                      <Badge variant="outline" className="text-xs bg-amber-100 border-amber-300 text-amber-700">
                        <Database className="h-2 w-2 mr-1" />
                        Estimated
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Footer */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              <span>{livePrices.length} live from CoinGecko • {fallbackPrices.length} estimated</span>
            </div>
            <div>Auto-refresh: 30s</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedMarketPricesCard;
