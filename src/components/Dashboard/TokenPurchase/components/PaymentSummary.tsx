
import React from 'react';
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface PaymentSummaryProps {
  amount: number;
  isProcessing: boolean;
  isLoading: boolean;
  hasCurrencies: boolean;
  selectedCurrency: string;
  onPaymentClick: () => void;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  amount,
  isProcessing,
  isLoading,
  hasCurrencies,
  selectedCurrency,
  onPaymentClick
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <p className="text-sm text-gray-600">Total amount:</p>
        <p className="text-lg font-medium text-gray-800">${amount.toLocaleString()}</p>
      </div>
      <Button 
        onClick={onPaymentClick} 
        disabled={isProcessing || isLoading || !hasCurrencies}
        className="bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 text-white py-2 px-4 sm:w-auto w-full"
      >
        {isLoading ? (
          <span className="flex items-center">
            <Spinner className="h-4 w-4 mr-2" />
            Loading...
          </span>
        ) : (
          `Pay with ${selectedCurrency}`
        )}
      </Button>
    </div>
  );
};

export default PaymentSummary;
