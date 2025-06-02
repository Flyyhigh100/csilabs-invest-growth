
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useCryptoPrices } from '@/hooks/admin/useCryptoPrices';
import { formatDistanceToNow } from 'date-fns';

const MarketPricesCard: React.FC = () => {
  const { data: prices, isLoading, error, dataUpdatedAt } = useCryptoPrices();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Market Prices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            Market Prices - Using Fallback Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm mb-4">
            Unable to fetch live prices. Showing fallback data.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!prices) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Market Prices (Live)
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <RefreshCw className="h-3 w-3" />
            {dataUpdatedAt && formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Current cryptocurrency prices from CoinCap API
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(prices).map((price) => (
            <div key={price.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">{price.symbol}</div>
                <div className="text-xs text-gray-500">{price.name}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">${price.price.toFixed(price.price > 1 ? 2 : 6)}</div>
                <div className="flex items-center gap-1">
                  {price.change24h >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <Badge 
                    variant={price.change24h >= 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketPricesCard;
