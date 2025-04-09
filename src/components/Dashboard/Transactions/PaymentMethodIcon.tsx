
import React from 'react';
import { CreditCard, InfoIcon } from 'lucide-react';

interface PaymentMethodIconProps {
  method: string;
}

const PaymentMethodIcon = ({ method }: PaymentMethodIconProps) => {
  switch (method.toLowerCase()) {
    case 'stripe':
      return <CreditCard className="h-4 w-4" />;
    case 'crypto':
    case 'coinpayments':
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15.5 9L8.5 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.5 9H15.5V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    default:
      return <InfoIcon className="h-4 w-4" />;
  }
};

export default PaymentMethodIcon;
