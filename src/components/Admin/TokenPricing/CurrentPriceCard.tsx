import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CurrentPriceCardProps {
  currentPrice: number | null;
  isPriceLoading?: boolean;
  refreshPrice?: () => void;
  formattedLastUpdated?: string;
  secondsUntilRefresh?: number;
  dataSource?: string | null;
}

const CurrentPriceCard: React.FC<CurrentPriceCardProps> = ({ currentPrice }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Current Token Price</span>
          <Badge variant="secondary">Locked</Badge>
        </CardTitle>
        <CardDescription>Display price is fixed at $1.00 USD per coin</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6">
          <div className="text-4xl font-bold text-blue-600">
            ${(currentPrice ?? 1).toFixed(2)}
          </div>
          <p className="mt-2 text-sm text-gray-500">USD - Per Coin (static)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentPriceCard;
