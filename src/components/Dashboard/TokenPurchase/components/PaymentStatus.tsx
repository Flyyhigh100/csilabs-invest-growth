
import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { KycVerificationData } from '@/hooks/kyc/types';
import { useTokenPrice } from '@/context/TokenPriceContext';

interface PaymentStatusProps {
  amount: number;
  kycData: KycVerificationData | null;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ amount, kycData }) => {
  const { currentPrice } = useTokenPrice();
  const tokenAmount = currentPrice ? amount / currentPrice : 0;

  // KYC required for crypto payments over $10,000
  if (amount >= 10000 && kycData?.status !== 'approved') {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600 mt-2">
        <AlertTriangle className="h-4 w-4" />
        <span>KYC verification required for crypto payments of $10,000 or more</span>
      </div>
    );
  }

  // Token limit warning
  if (tokenAmount > 10000) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600 mt-2">
        <AlertTriangle className="h-4 w-4" />
        <span>Maximum purchase limit is 10,000 tokens per transaction</span>
      </div>
    );
  }
  
  // All good - show secure payment message
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
      <CheckCircle className="h-4 w-4 text-green-500" />
      <span>Secure payment processing by CoinPayments</span>
    </div>
  );
};

export default PaymentStatus;
