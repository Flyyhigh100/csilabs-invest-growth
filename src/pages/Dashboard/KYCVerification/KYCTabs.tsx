
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KycVerificationData, KycStatus } from '@/hooks/kyc/types';
import TabHandlers from './TabHandlers';
import PersonalInfoTab from './PersonalInfoTab';
import DocumentVerificationTab from './DocumentVerificationTab';
import VerificationStatusTab from './VerificationStatusTab';
import { supabase } from '@/integrations/supabase/client';

const KYCTabs = ({ kycData }: { kycData: KycVerificationData | null }) => {
  // Initialize with the appropriate tab based on verification status
  const getInitialTab = () => {
    if (!kycData) return 'personal-info';
    
    const status = kycData.status;
    
    switch (status) {
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
    const newTab = getInitialTab();
    console.log('KYC status changed:', kycData?.status, 'Setting tab to:', newTab);
    setActiveTab(newTab);
  }, [kycData?.status]);
  
  // Access the tab handlers
  const {
    handlePersonalInfoSubmit,
    handleDocumentUpload,
    handleVerificationSubmit,
    handleRestartVerification,
    isSubmitting,
    uploadPending,
    debugInfo
  } = TabHandlers(kycData, setActiveTab);
  
  // Determine if each tab is enabled based on validation
  const isDocumentsEnabled = !!kycData?.first_name;
  const isStatusEnabled = true; // Always enable status tab to see current state
  
  // Force the status tab to be active if verification is pending or complete
  useEffect(() => {
    if (kycData?.status === 'pending' || kycData?.status === 'approved' || kycData?.status === 'rejected') {
      console.log('Forcing status tab due to KYC status:', kycData?.status);
      setActiveTab('status');
    }
  }, [kycData?.status]);

  // Debug log for tab changes
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
  }, [activeTab]);
  
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
          isPending={isSubmitting}
        />
      </TabsContent>
      
      <TabsContent value="documents">
        <DocumentVerificationTab
          kycData={kycData}
          uploadPending={uploadPending}
          isSubmitting={isSubmitting}
          onBack={() => setActiveTab('personal-info')}
          onSubmit={handleVerificationSubmit}
          onUpload={handleDocumentUpload}
          debugInfo={debugInfo}
        />
      </TabsContent>
      
      <TabsContent value="status">
        <VerificationStatusTab
          kycData={kycData}
          isLoading={false}
          onStartVerification={handleRestartVerification}
          onProvideMoreInfo={() => setActiveTab('documents')}
        />
      </TabsContent>
    </Tabs>
  );
};

export default KYCTabs;
