
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CreditCard, DollarSign } from 'lucide-react';

interface TokenDistributionCardProps {
  pendingTokensCount: number;
  totalTransactionValue: number;
  isLoading: boolean;
}

const TokenDistributionCard: React.FC<TokenDistributionCardProps> = ({ 
  pendingTokensCount, 
  totalTransactionValue, 
  isLoading 
}) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 text-blue-800 rounded-lg">
            <h3 className="font-medium flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Pending Token Transfers
            </h3>
            <p className="mt-2 text-sm">
              There are <strong>{isLoading ? '...' : pendingTokensCount}</strong> users waiting to receive tokens after their payment was processed.
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium">Distribution Information</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="text-sm">
                <span className="text-gray-500">Total Value:</span>
                <p className="font-bold">${isLoading ? '...' : totalTransactionValue.toFixed(2)}</p>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Networks:</span>
                <p className="font-medium">Polygon, Solana</p>
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full mt-4 bg-gradient-to-r from-cbis-blue to-cbis-teal"
            onClick={() => navigate('/admin/transactions')}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Manage Token Distribution
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenDistributionCard;
