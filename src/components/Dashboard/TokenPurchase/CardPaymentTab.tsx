
import React from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle } from 'lucide-react';

interface CardPaymentTabProps {
  amount: number;
  handleStripePayment: (amount: number) => Promise<void>;
  isProcessing: boolean;
  isWalletMissing: boolean;
}

const CardPaymentTab: React.FC<CardPaymentTabProps> = ({
  amount,
  handleStripePayment,
  isProcessing,
  isWalletMissing
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-white p-2 rounded-full border border-gray-200">
          <CreditCard className="h-6 w-6 text-cbis-blue" />
        </div>
        <div>
          <h4 className="font-medium text-gray-800">Credit/Debit Card Payment</h4>
          <p className="text-sm text-gray-600 mt-1">
            Fast and secure payment using Stripe. No KYC verification required.
          </p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600">Total amount:</p>
          <p className="text-lg font-medium text-gray-800">${amount.toLocaleString()}</p>
        </div>
        <Button 
          onClick={() => handleStripePayment(amount)} 
          disabled={isProcessing || isWalletMissing}
          className="bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 text-white py-2 px-4 sm:w-auto w-full"
        >
          Proceed to Payment
        </Button>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span>Secure payment processing by Stripe</span>
      </div>
    </div>
  );
};

export default CardPaymentTab;
