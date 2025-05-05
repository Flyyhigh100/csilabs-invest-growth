
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, RefreshCw, Loader2 } from 'lucide-react';

interface CurrentPriceCardProps {
  currentPrice: number | null;
  isPriceLoading: boolean;
  refreshPrice: () => void;
  formattedLastUpdated: string;
  secondsUntilRefresh: number;
}

const CurrentPriceCard: React.FC<CurrentPriceCardProps> = ({
  currentPrice,
  isPriceLoading,
  refreshPrice,
  formattedLastUpdated,
  secondsUntilRefresh,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Current Token Price</span>
          <Badge variant={isPriceLoading ? "outline" : "secondary"}>
            {isPriceLoading ? 'Loading...' : 'Live'}
          </Badge>
        </CardTitle>
        <CardDescription>Current pricing for token purchases</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600">
            {isPriceLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                Loading...
              </div>
            ) : currentPrice ? (
              `$${currentPrice.toFixed(5)}`
            ) : (
              'Not available'
            )}
          </div>
          
          <div className="mt-2 text-sm text-gray-500 flex items-center justify-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>
              {secondsUntilRefresh > 0 ? 
                `Auto-refresh in ${secondsUntilRefresh}s` : 
                'Refreshing...'
              }
            </span>
          </div>
        </div>
        
        <Alert className="bg-blue-50 text-blue-800 border-blue-200">
          <AlertDescription className="flex flex-col space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Primary data source:</span>
              <span className="font-medium">Uniswap V4 Subgraph</span>
            </div>
            <div className="flex justify-between">
              <span>Last updated:</span>
              <span className="font-medium">{formattedLastUpdated}</span>
            </div>
            <div className="flex justify-between">
              <span>Cache duration:</span>
              <span className="font-medium">60 seconds</span>
            </div>
          </AlertDescription>
        </Alert>

        <div className="pt-4">
          <Button 
            className="w-full" 
            onClick={refreshPrice} 
            disabled={isPriceLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isPriceLoading ? 'animate-spin' : ''}`} />
            {isPriceLoading ? 'Refreshing...' : 'Refresh Price Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentPriceCard;
