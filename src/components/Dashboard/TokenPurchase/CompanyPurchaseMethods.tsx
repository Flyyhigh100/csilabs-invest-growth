
import React from 'react';
import { CreditCard, Coins, Check } from 'lucide-react';
import PurchaseMethodCard from './components/PurchaseMethodCard';

interface CompanyPurchaseMethodsProps {
  amount: number;
  isProcessing: boolean;
  isWalletMissing: boolean;
  onSelectStripe: () => void;
  onSelectCrypto: () => void;
}

const CompanyPurchaseMethods: React.FC<CompanyPurchaseMethodsProps> = ({
  amount,
  isProcessing,
  isWalletMissing,
  onSelectStripe,
  onSelectCrypto
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 mb-2">
        <h3 className="text-lg font-medium">Direct Purchase Options</h3>
        <p className="text-sm text-gray-600">
          These official purchase methods directly support company operations and development.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PurchaseMethodCard
          title="Buy Crypto with Card"
          description="Quick and secure crypto purchase using Stripe. Pay with credit card, Apple Pay, or Google Pay."
          icon={<CreditCard className="h-6 w-6" />}
          onClick={onSelectStripe}
          buttonLabel={`Buy $${amount}`}
          disabled={isProcessing || isWalletMissing}
          highlight={true}
          badgeText="Recommended"
          badgeVariant="secondary"
        >
          <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
            <Check className="h-4 w-4" />
            <span>Directly supports company operations</span>
          </div>
        </PurchaseMethodCard>
        
        <PurchaseMethodCard
          title="More Crypto Options"
          description="Pay with your preferred cryptocurrency. Additional verification may be required."
          icon={<Coins className="h-6 w-6" />}
          onClick={onSelectCrypto}
          buttonLabel={`Pay $${amount}`}
          disabled={isProcessing || isWalletMissing}
        >
          <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
            <Check className="h-4 w-4" />
            <span>Directly supports company operations</span>
          </div>
        </PurchaseMethodCard>
      </div>
    </div>
  );
};

export default CompanyPurchaseMethods;
