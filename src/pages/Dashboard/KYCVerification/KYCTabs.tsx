
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KycVerificationData } from '@/hooks/kyc/types';
import TabHandlers from './TabHandlers';
import PersonalInfoTab from './PersonalInfoTab';
import DocumentVerificationTab from './DocumentVerificationTab';
import VerificationStatusTab from './VerificationStatusTab';

const KYCTabs = ({ kycData }: { kycData: KycVerificationData | null }) => {
  // Initialize with the appropriate tab based on verification status
  const getInitialTab = () => {
    if (!kycData) return 'personal-info';
    
    const status = kycData.status;
    console.log('🔍 Determining initial tab based on KYC status:', status);
    
    switch (status) {
      case 'pending':
      case 'approved':
      case 'rejected':
        console.log('📊 Status indicates we should show status tab');
        return 'status';
      case 'needs_clarification':
        console.log('❓ User needs to provide clarifications, showing documents tab');
        return 'documents'; // Default to documents tab when clarification is needed
      default:
        // If personal info exists, show documents, otherwise show personal info
        if (kycData.first_name) {
          console.log('👤 Personal info exists, showing documents tab');
          return 'documents';
        } else {
          console.log('📋 Personal info missing, showing personal info tab');
          return 'personal-info';
        }
    }
  };
  
  const [activeTab, setActiveTab] = useState<string>(getInitialTab());
  
  // Debug log for active tab changes
  useEffect(() => {
    console.log('🔄 Active tab changed to:', activeTab);
  }, [activeTab]);
  
  // When kycData changes, update the active tab if needed
  useEffect(() => {
    if (!kycData) return;
    
    console.log('🔄 KYC data updated. Current status:', kycData.status, 'Active tab:', activeTab);
    
    // Handle status changes that should trigger tab changes
    if ((kycData.status === 'pending' || kycData.status === 'approved' || kycData.status === 'rejected') 
        && activeTab !== 'status') {
      console.log('📊 Status changed to', kycData.status, '- switching to status tab');
      setActiveTab('status');
    } else if (kycData.status === 'needs_clarification' && activeTab !== 'documents') {
      console.log('❓ Status changed to needs clarification - switching to documents tab');
      setActiveTab('documents');
    }
  }, [kycData?.status, activeTab]);
  
  // Access the tab handlers
  const {
    handlePersonalInfoSubmit,
    handleDocumentUpload,
    handleVerificationSubmit,
    handleRestartVerification,
    isSubmitting,
    uploadPending
  } = TabHandlers(kycData, setActiveTab);
  
  // Determine if each tab is enabled based on validation
  const isDocumentsEnabled = !!kycData?.first_name;
  const isPending = kycData?.status === 'pending';
  const isApproved = kycData?.status === 'approved';

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab} 
      className="w-full"
    >
      <TabsList className="grid grid-cols-3 mb-8">
        <TabsTrigger 
          value="personal-info"
          disabled={isPending || isApproved}
          data-testid="tab-personal-info"
        >
          Personal Info
        </TabsTrigger>
        <TabsTrigger 
          value="documents"
          disabled={!isDocumentsEnabled || isPending || isApproved}
          data-testid="tab-documents"
        >
          Documents
        </TabsTrigger>
        <TabsTrigger 
          value="status"
          data-testid="tab-status"
        >
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
