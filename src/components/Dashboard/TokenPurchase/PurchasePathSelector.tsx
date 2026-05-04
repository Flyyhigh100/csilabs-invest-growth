import React from 'react';
import { DollarSign, Crown, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PurchaseMethodCard from './components/PurchaseMethodCard';

const WHITE_GLOVE_EMAIL = 'raymond.dabney@cannabisscience.com';

interface PurchasePathSelectorProps {
  amount: number;
  isProcessing: boolean;
  isWalletMissing: boolean;
  onSelectCoinPayments: () => void;
  setDirectPurchase?: (isDirectPurchase: boolean) => void;
}

const PurchasePathSelector: React.FC<PurchasePathSelectorProps> = ({
  isProcessing,
  isWalletMissing,
  onSelectCoinPayments,
  setDirectPurchase,
}) => {
  const handleSelectCoinPayments = () => {
    if (setDirectPurchase) {
      setDirectPurchase(true);
    }
    onSelectCoinPayments();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-medium">Select Your Preferred Purchase Method</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose how you'd like to contribute to CSi Labs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PurchaseMethodCard
          title="Direct Charitable Contribution"
          description="Contribute directly @ $1.00 USD per coin. Funds support Harvard Award Winning low-cost cancer-killing drug development, FDA Clinical Trials, and laboratory operations."
          icon={<DollarSign className="h-6 w-6" />}
          onClick={handleSelectCoinPayments}
          buttonLabel="Contribute Now"
          disabled={isProcessing || isWalletMissing}
          highlight={true}
          badgeText="Register for your Free Account"
          badgeVariant="secondary"
        />

        <PurchaseMethodCard
          title="White Glove Service"
          description="VIP concierge for $1,000+ contributions. Bank wire instructions and dedicated onboarding from the CSi Labs team."
          icon={<Crown className="h-6 w-6" />}
          onClick={() => {}}
          buttonLabel=""
          disabled={false}
          badgeText="VIP"
          badgeVariant="secondary"
        >
          <Button
            asChild
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 text-white mt-2"
            size="sm"
          >
            <a
              href={`mailto:${WHITE_GLOVE_EMAIL}?subject=White%20Glove%20Service%20Request%20-%20VIP%20Contribution&body=I%20would%20like%20to%20request%20White%20Glove%20Service%20for%20a%20contribution%20of%20%241%2C000%2B.%20Please%20send%20me%20bank%20wire%20instructions%20and%20VIP%20onboarding%20details.`}
            >
              <Mail className="h-4 w-4" />
              Request White Glove Service
            </a>
          </Button>
        </PurchaseMethodCard>
      </div>

      <Separator className="my-4" />

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-sm mb-2">Why contribute to CSi Labs?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Funds directly support Harvard Award Winning cancer-killing drug development</li>
          <li>• Supports FDA Clinical Trials and laboratory operations</li>
          <li>• Direct relationship with the CSi Labs team</li>
          <li>• Locked-in $1.00 USD per coin pre-launch pricing</li>
        </ul>
      </div>
    </div>
  );
};

export default PurchasePathSelector;
