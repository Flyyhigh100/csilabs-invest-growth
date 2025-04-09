
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
  
  // Use the tab handlers
  const {
    handlePersonalInfoSubmit,
    handleDocumentUpload,
    handleVerificationSubmit,
    handleRestartVerification,
    handleManualStatusRefresh, // New handler for manual refresh
    isSubmitting,
    uploadPending,
    debugInfo
  } = TabHandlers(kycData, setActiveTab);
  
  // Determine if the verification is pending
  const isPending = kycData?.status === 'pending' || 
    kycData?.status === 'approved' || 
    kycData?.status === 'rejected';
  
  // Determine if documents are uploaded
  const hasIdFront = !!kycData?.id_front_url;
  const hasIdBack = !!kycData?.id_back_url;
  const hasSelfie = !!kycData?.selfie_url;

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
          onManualRefresh={handleManualStatusRefresh} // Pass the refresh handler
          uploadPending={uploadPending}
          debugInfo={debugInfo}
        />
      </TabsContent>
      
      <TabsContent value="status">
        <VerificationStatusTab 
          kycData={kycData}
          onRestart={handleRestartVerification} 
          onRefresh={handleManualStatusRefresh} // Pass the refresh handler
        />
      </TabsContent>
    </Tabs>
  );
};

export default KYCTabs;
