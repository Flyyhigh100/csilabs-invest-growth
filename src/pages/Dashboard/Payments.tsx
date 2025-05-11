
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
import PaymentSidePanel from '@/components/Dashboard/Payments/PaymentSidePanel';
import { cn } from '@/lib/utils';

const Payments = () => {
  const { kycData } = useKycVerification();
  const [showInfoCard, setShowInfoCard] = React.useState(true);
  const { walletAddress, isLoadingWallet, handleWalletUpdated } = useWalletAddress();
  
  const isKycApproved = kycData?.status === 'approved';
  // Allow token purchases below regulatory threshold without prior KYC
  const allowPaymentsWithoutKYC = true;
  
  return (
    <DashboardLayout title="Payments">
      {/* Check payment status from URL params */}
      <PaymentStatusCheck />
      
      {!isKycApproved && !allowPaymentsWithoutKYC ? (
        <KycWarning />
      ) : (
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-5 gap-6",
          "bg-gray-50 rounded-xl p-6 mb-6"
        )}>
          {/* Left Column - Information Panel (40% width) */}
          <div className="md:col-span-2 space-y-6">
            <PaymentSidePanel 
              kycData={kycData}
              showInfoCard={showInfoCard}
              setShowInfoCard={setShowInfoCard}
            />
          </div>
          
          {/* Right Column - Purchase Flow (60% width) */}
          <div className="md:col-span-3 space-y-6">
            <KycStatusAlerts 
              kycData={kycData} 
              amount={0} 
              allowPaymentsWithoutKYC={allowPaymentsWithoutKYC} 
            />
            
            <TokenPurchaseSections
              isLoadingWallet={isLoadingWallet}
              walletAddress={walletAddress}
              onWalletUpdated={handleWalletUpdated}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Payments;
