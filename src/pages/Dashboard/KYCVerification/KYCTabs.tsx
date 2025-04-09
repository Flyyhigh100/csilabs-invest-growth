
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PersonalInfoTab from './PersonalInfoTab';
import DocumentVerificationTab from './DocumentVerificationTab';
import VerificationStatusTab from './VerificationStatusTab';
import { KycVerificationData } from '@/hooks/kyc/types';
import TabHandlers from './TabHandlers';

interface KYCTabsProps {
  kycData: KycVerificationData | null;
}

const KYCTabs: React.FC<KYCTabsProps> = ({ kycData }) => {
  const [activeTab, setActiveTab] = useState('personal-info');
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [manuallyRefreshing, setManuallyRefreshing] = useState(false);
  
  // Use the tab handlers
  const {
    handlePersonalInfoSubmit,
    handleDocumentUpload,
    handleVerificationSubmit,
    handleRestartVerification,
    isSubmitting,
    uploadPending
  } = TabHandlers(kycData, setActiveTab);
  
  // New handler for manual refresh
  const handleManualStatusRefresh = async () => {
    setManuallyRefreshing(true);
    try {
      // The TabHandlers already has refetch functionality
      // We just need to record the time of refresh
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error during manual refresh:', error);
    } finally {
      setManuallyRefreshing(false);
    }
  };
  
  // Determine if the verification is pending
  const isPending = kycData?.status === 'pending' || 
    kycData?.status === 'approved' || 
    kycData?.status === 'rejected';
  
  // Determine if documents are uploaded
  const hasIdFront = !!kycData?.id_front_url;
  const hasIdBack = !!kycData?.id_back_url;
  const hasSelfie = !!kycData?.selfie_url;
  
  // Debug info for testing
  const debugInfo = {
    currentStatus: kycData?.status,
    lastRefresh: lastRefreshTime ? lastRefreshTime.toISOString() : null,
    attempts: 0
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="status">Status</TabsTrigger>
      </TabsList>
      
      <TabsContent value="personal-info">
        <PersonalInfoTab 
          kycData={kycData} 
          onSubmit={handlePersonalInfoSubmit}
          isPending={isPending}
          isSubmitting={isSubmitting}
          isDisabled={isPending}
        />
      </TabsContent>
      
      <TabsContent value="documents">
        <DocumentVerificationTab 
          kycData={kycData}
          hasIdFront={hasIdFront}
          hasIdBack={hasIdBack}
          hasSelfie={hasSelfie}
          isPending={isPending}
          isSubmitting={isSubmitting}
          onBack={() => setActiveTab('personal-info')}
          onSubmit={handleVerificationSubmit}
          onUpload={handleDocumentUpload}
          onManualRefresh={handleManualStatusRefresh}
          uploadPending={uploadPending}
          debugInfo={debugInfo}
        />
      </TabsContent>
      
      <TabsContent value="status">
        <VerificationStatusTab 
          kycData={kycData}
          onRestart={handleRestartVerification} 
          onRefresh={handleManualStatusRefresh}
        />
      </TabsContent>
    </Tabs>
  );
};

export default KYCTabs;
