
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KycVerificationData } from '@/hooks/kyc/types';
import { TabHandlers } from './TabHandlers';
import PersonalInfoTab from './PersonalInfoTab';
import DocumentVerificationTab from './DocumentVerificationTab';
import VerificationStatusTab from './VerificationStatusTab';

const KYCTabs = ({ kycData }: { kycData: KycVerificationData | null }) => {
  // Initialize with the appropriate tab based on verification status
  const getInitialTab = () => {
    if (!kycData) return 'personal-info';
    
    switch (kycData.status) {
      case 'pending':
      case 'approved':
      case 'rejected':
        return 'status';
      case 'needs_clarification':
        return 'documents'; // Default to documents tab when clarification is needed
      default:
        return kycData.first_name ? 'documents' : 'personal-info';
    }
  };
  
  const [activeTab, setActiveTab] = useState<string>(getInitialTab());
  
  // When kycData changes, update the active tab if needed
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [kycData?.status]);
  
  // Access the tab handlers
  const {
    handlePersonalInfoSubmit,
    handleDocumentUpload,
    handleVerificationSubmit,
    handleRestartVerification,
    isSubmitting
  } = TabHandlers(kycData, setActiveTab);
  
  // Determine if each tab is enabled based on validation
  const isDocumentsEnabled = !!kycData?.first_name;
  const isStatusEnabled = !!kycData?.id_front_url && !!kycData?.id_back_url && !!kycData?.selfie_url;
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3 mb-8">
        <TabsTrigger 
          value="personal-info"
          disabled={kycData?.status === 'pending' || kycData?.status === 'approved'}
        >
          Personal Info
        </TabsTrigger>
        <TabsTrigger 
          value="documents"
          disabled={!isDocumentsEnabled || kycData?.status === 'pending' || kycData?.status === 'approved'}
        >
          Documents
        </TabsTrigger>
        <TabsTrigger value="status">
          Status
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="personal-info">
        <PersonalInfoTab
          kycData={kycData}
          onSubmit={handlePersonalInfoSubmit}
          isSubmitting={isSubmitting}
        />
      </TabsContent>
      
      <TabsContent value="documents">
        <DocumentVerificationTab
          hasIdFront={!!kycData?.id_front_url}
          hasIdBack={!!kycData?.id_back_url}
          hasSelfie={!!kycData?.selfie_url}
          isPending={kycData?.status === 'pending'}
          isSubmitting={isSubmitting}
          onBack={() => setActiveTab('personal-info')}
          onSubmit={handleVerificationSubmit}
          onUpload={handleDocumentUpload}
          clarificationMessage={kycData?.clarification_message}
        />
      </TabsContent>
      
      <TabsContent value="status">
        <VerificationStatusTab
          status={kycData?.status || 'not_started'}
          rejectionReason={kycData?.rejection_reason}
          clarificationMessage={kycData?.clarification_message}
          onStartVerification={() => {
            handleRestartVerification();
            setActiveTab('personal-info');
          }}
          onProvideMoreInfo={() => setActiveTab('documents')}
        />
      </TabsContent>
    </Tabs>
  );
};

export default KYCTabs;
