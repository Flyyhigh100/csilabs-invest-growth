
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CryptoPaymentDetails } from '@/hooks/payments/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface InstructionsSectionProps {
  paymentDetails: CryptoPaymentDetails | null;
  instructions?: string; // Add this optional prop
}

const InstructionsSection: React.FC<InstructionsSectionProps> = ({ 
  paymentDetails, 
  instructions 
}) => {
  // No payment details
  if (!paymentDetails) return null;
  
  // Extract and format information from payment details
  const currency = paymentDetails.currency || 'USDT';
  
  // Format crypto amount for display (ensure it shows the exact amount needed)
  const cryptoAmount = paymentDetails.amount || '0';
  const usdValue = paymentDetails.usdValue || 0;
  
  // For stablecoins like USDT, USDC that are pegged to USD, the amounts may be nearly the same
  // But for other cryptocurrencies, they will be different based on exchange rates
  const isStablecoin = ['USDT', 'USDC', 'DAI', 'BUSD'].includes(currency);
  
  // Use the passed instructions or fallback to default
  const displayInstructions = instructions || 
    paymentDetails.instructions || 
    `Send exactly ${cryptoAmount} ${currency} to the address below to complete your purchase.`;
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="font-medium">Payment Instructions</h3>
          
          <div className="py-2 text-sm text-gray-700 space-y-4">
            <p>
              To complete your purchase, please send the following amount:
            </p>
            
            <div className="flex flex-col space-y-1">
              <div className="font-mono bg-gray-100 p-3 rounded-md border border-gray-300 flex flex-col">
                <span className="text-lg font-semibold text-gray-800">{cryptoAmount} {currency}</span>
                <span className="text-xs text-gray-600">≈ ${usdValue.toFixed(2)} USD</span>
              </div>
              
              <p className="text-xs text-gray-500 mt-1">
                Exchange rates are locked for 60 minutes. Please complete payment before expiry.
              </p>
            </div>
            
            {!isStablecoin && (
              <Alert variant="default" className="bg-blue-50 text-blue-700 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-xs">
                  The amount above has been converted from ${usdValue.toFixed(2)} USD to {cryptoAmount} {currency} 
                  using current exchange rates.
                </AlertDescription>
              </Alert>
            )}
            
            <p>
              {displayInstructions}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstructionsSection;

