
import React from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import KycWarning from '@/components/Dashboard/KycWarning';
import PaymentInfoCard from '@/components/Dashboard/PaymentInfoCard';
import KycStatusAlerts from '@/components/Dashboard/KycStatusAlerts';
import { WalletSection, TokenPurchaseSection } from '@/components/Dashboard/Payments/PaymentSections';
import { PaymentStatusCheck } from '@/components/Dashboard/Payments/StatusChecks';
import { useWalletAddress } from '@/components/Dashboard/Payments/useWalletAddress';
import TokenPriceHeaderWithProvider from '@/components/Dashboard/TokenPriceHeaderWithProvider';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { usePurchaseFlow } from '@/hooks/payments/usePurchaseFlow';

const Payments = () => {
  const { kycData } = useKycVerification();
  const [showInfoCard, setShowInfoCard] = React.useState(true);
  const { walletAddress, isLoadingWallet, handleWalletUpdated } = useWalletAddress();
  const { resetFlow } = usePurchaseFlow();
  
  const isKycApproved = kycData?.status === 'approved';
  // For testing purposes - we're allowing payments even without KYC approval
  const allowPaymentsWithoutKYC = true;
  
  return (
    <DashboardLayout title="Payments">
      {/* Check payment status from URL params */}
      <PaymentStatusCheck />
      
      {!isKycApproved && !allowPaymentsWithoutKYC ? (
        <KycWarning />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <TokenPriceHeaderWithProvider />
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetFlow}
              className="flex items-center gap-1"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              <span>Reset Guide</span>
            </Button>
          </div>
          
          <PaymentInfoCard 
            showInfoCard={showInfoCard} 
            setShowInfoCard={setShowInfoCard} 
          />

          <KycStatusAlerts 
            kycData={kycData} 
            amount={0} 
            allowPaymentsWithoutKYC={allowPaymentsWithoutKYC} 
          />
          
          <div className="space-y-6">
            {/* Wallet Address Section */}
            <WalletSection 
              isLoadingWallet={isLoadingWallet}
              walletAddress={walletAddress}
              onWalletUpdated={handleWalletUpdated}
            />
            
            {/* Token Purchase Section */}
            <TokenPurchaseSection 
              walletAddress={walletAddress}
            />
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Payments;
