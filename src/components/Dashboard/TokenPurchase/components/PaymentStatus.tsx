
import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { KycVerificationData } from '@/hooks/kyc/types';

interface PaymentStatusProps {
  amount: number;
  kycData: KycVerificationData | null;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ amount, kycData }) => {
  if (amount >= 10000 && kycData?.status !== 'approved') {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600 mt-2">
        <AlertTriangle className="h-4 w-4" />
        <span>KYC verification required for amounts $10,000 or more</span>
      </div>
    );
  }
  
  if (amount < 10000 || kycData?.status === 'approved') {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span>Secure payment processing by CoinPayments</span>
      </div>
    );
  }
  
  return null;
};

export default PaymentStatus;
