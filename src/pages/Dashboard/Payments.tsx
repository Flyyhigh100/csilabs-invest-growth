
import React from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import KycWarning from '@/components/Dashboard/KycWarning';
import PaymentInfoCard from '@/components/Dashboard/PaymentInfoCard';
import KycStatusAlerts from '@/components/Dashboard/KycStatusAlerts';
import { PaymentStatusCheck } from '@/components/Dashboard/Payments/StatusChecks';
import { useWalletAddress } from '@/components/Dashboard/Payments/useWalletAddress';
import TokenPriceHeaderWithProvider from '@/components/Dashboard/TokenPriceHeaderWithProvider';
import { TokenPurchaseSections } from '@/components/Dashboard/Payments/PaymentSections';

const Payments = () => {
  const { kycData } = useKycVerification();
  const [showInfoCard, setShowInfoCard] = React.useState(true);
  const { walletAddress, isLoadingWallet, handleWalletUpdated } = useWalletAddress();
  
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
            {/* Token Purchase Sections - Combined into one component */}
            <TokenPurchaseSections
              isLoadingWallet={isLoadingWallet}
              walletAddress={walletAddress}
              onWalletUpdated={handleWalletUpdated}
            />
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Payments;
