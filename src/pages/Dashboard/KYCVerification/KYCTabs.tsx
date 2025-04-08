
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
    console.log('Initializing KYC tabs with data:', kycData);
    
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
  const [isManualTabChange, setIsManualTabChange] = useState(false);
  const [tabChangeCounter, setTabChangeCounter] = useState(0);
  
  // When kycData changes, update the active tab if needed
  useEffect(() => {
    // Only auto-change tabs if there wasn't a manual tab change
    if (!isManualTabChange) {
      const newTab = getInitialTab();
      console.log('KYC status changed:', kycData?.status, 'Setting tab to:', newTab);
      
      if (newTab !== activeTab) {
        setActiveTab(newTab);
        setTabChangeCounter(prev => prev + 1);
      }
    }
    
    // Reset the manual flag after use
    setIsManualTabChange(false);
  }, [kycData?.status, kycData?.submitted_at]);
  
  // Wrapped setter for the active tab that tracks manual changes
  const handleTabChange = (tab: string) => {
    console.log('Manual tab change to:', tab);
    setIsManualTabChange(true);
    setActiveTab(tab);
    setTabChangeCounter(prev => prev + 1);
  };
  
  // Access the tab handlers
  const {
    handlePersonalInfoSubmit,
    handleDocumentUpload,
    handleVerificationSubmit,
    handleRestartVerification,
    isSubmitting,
    uploadPending,
    debugInfo,
    submissionAttemptCount
  } = TabHandlers(kycData, handleTabChange);
  
  // Determine if each tab is enabled based on validation
  const isDocumentsEnabled = !!kycData?.first_name;
  
  // Force the status tab to be active if verification is pending or complete
  useEffect(() => {
    const isPendingOrCompleted = 
      kycData?.status === 'pending' || 
      kycData?.status === 'approved' || 
      kycData?.status === 'rejected';
      
    // Check if we have a submitted_at timestamp, indicating a successful submission
    const isSubmitted = !!kycData?.submitted_at;
      
    if ((isPendingOrCompleted || isSubmitted) && activeTab !== 'status') {
      console.log('Forcing status tab due to KYC status:', kycData?.status);
      setIsManualTabChange(false); // Allow automatic tab change
      handleTabChange('status');
    }
  }, [kycData?.status, kycData?.submitted_at]);

  // Debug log for tab changes
  useEffect(() => {
    console.log('Active tab changed to:', activeTab, 'Counter:', tabChangeCounter);
    
    // If we're on the status tab and have a submitted timestamp, force a refresh
    if (activeTab === 'status' && kycData?.submitted_at) {
      const checkForUpdates = async () => {
        try {
          if (!kycData.user_id) return;
          
          console.log('Performing manual status check from status tab');
          const { data } = await supabase
            .from('kyc_verifications')
            .select('status, submitted_at')
            .eq('user_id', kycData.user_id)
            .single();
            
          console.log('Manual status check result:', data);
        } catch (error) {
          console.error('Error checking status:', error);
        }
      };
      
      checkForUpdates();
    }
  }, [activeTab, tabChangeCounter]);
  
  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue={activeTab}>
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
          onBack={() => handleTabChange('personal-info')}
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
          onProvideMoreInfo={() => handleTabChange('documents')}
        />
      </TabsContent>
    </Tabs>
  );
};

export default KYCTabs;
