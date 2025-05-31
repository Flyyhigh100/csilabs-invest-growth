
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface PaymentNotesSectionProps {
  selectedCurrency: string;
  selectedNetwork: string;
  getNetworkDisplayName: (network: string) => string;
  isStablecoin: (currency: string) => boolean;
}

const PaymentNotesSection: React.FC<PaymentNotesSectionProps> = ({
  selectedCurrency,
  selectedNetwork,
  getNetworkDisplayName,
  isStablecoin
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn("space-y-4 pt-4 border-t", isMobile && "space-y-3 pt-3")}>
      <h4 className={cn("font-medium", isMobile && "text-sm")}>Important Notes</h4>
      <ul className={cn("space-y-2 text-sm text-muted-foreground list-disc pl-5", isMobile && "space-y-1 text-xs")}>
        <li>Send only {selectedCurrency} on the {getNetworkDisplayName(selectedNetwork)} network</li>
        <li>Payment will be verified manually by our team</li>
        <li>Tokens will be distributed after verification (typically within 24 hours)</li>
        <li>Minimum purchase amount is $1</li>
        {!isStablecoin(selectedCurrency) && (
          <li className="text-amber-600">
            Due to price volatility, the exact {selectedCurrency} amount will be calculated when you create the payment
          </li>
        )}
      </ul>
    </div>
  );
};

export default PaymentNotesSection;
