
import React, { useState } from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import KycWarning from '@/components/Dashboard/KycWarning';
import PaymentInfoCard from '@/components/Dashboard/PaymentInfoCard';
import KycStatusAlerts from '@/components/Dashboard/KycStatusAlerts';
import { WalletSection, TokenPurchaseSection } from '@/components/Dashboard/Payments/PaymentSections';
import { PaymentStatusCheck } from '@/components/Dashboard/Payments/StatusChecks';
import { useWalletAddress } from '@/components/Dashboard/Payments/useWalletAddress';

const Payments = () => {
  const { kycData } = useKycVerification();
  const [activeTab, setActiveTab] = useState('buy');
  const [showInfoCard, setShowInfoCard] = useState(true);
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
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              walletAddress={walletAddress}
            />
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Payments;
