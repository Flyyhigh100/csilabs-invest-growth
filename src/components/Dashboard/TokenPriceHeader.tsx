import React from 'react';
import { Card } from "@/components/ui/card";
import { TrendingUp } from 'lucide-react';
import { STATIC_TOKEN_PRICE } from '@/services/api/staticPrice';

interface TokenPriceHeaderProps {
  className?: string;
}

const TokenPriceHeader: React.FC<TokenPriceHeaderProps> = ({ className = "" }) => {
  return (
    <Card className={`flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 ${className}`}>
      <div className="flex items-center">
        <TrendingUp className="h-5 w-5 text-cbis-blue mr-2" />
        <div>
          <p className="text-sm font-medium text-gray-600">CSi Labs (CSL) Current Spot Price</p>
          <p className="text-lg font-bold text-cbis-blue">
            ${STATIC_TOKEN_PRICE.toFixed(2)} USD - Per Coin
          </p>
        </div>
      </div>
    </Card>
  );
};

export default TokenPriceHeader;
