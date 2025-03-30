import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import { toast } from 'sonner';
import { PersonalInfoValues } from '@/components/KYC/schema/personalInfoSchema';
import { getInitialActiveTab } from './TabHandlers';
import PersonalInfoTab from './PersonalInfoTab';
import DocumentVerificationTab from './DocumentVerificationTab';
import VerificationStatusTab from './VerificationStatusTab';
import { KycVerificationData } from '@/hooks/kyc/types';

interface KYCTabsProps {
  kycData: KycVerificationData | null;
}

const KYCTabs: React.FC<KYCTabsProps> = ({ kycData }) => {
  const {
    savePersonalInfo,
    uploadDocument,
    submitVerification,
    refetch
  } = useKycVerification();
  
  const [activeTab, setActiveTab] = useState<string>(() => getInitialActiveTab(kycData));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Monitor kycData changes to update tab selection
  useEffect(() => {
    if (kycData) {
      console.log("KYC data updated in component, current status:", kycData.status);
      
      if (kycData.status === 'pending' || kycData.status === 'approved' || kycData.status === 'rejected') {
        console.log("Setting active tab to verification-status based on KYC status:", kycData.status);
        setActiveTab("verification-status");
      }
    }
  }, [kycData]);

  const handlePersonalInfoSubmit = async (values: PersonalInfoValues) => {
    try {
      console.log("Submitting personal info form:", values);
      
      // Ensure all required fields are present and convert to KycFormData type
      const formData = {
        first_name: values.first_name,
        last_name: values.last_name,
        date_of_birth: values.date_of_birth,
        nationality: values.nationality,
        address: values.address,
        city: values.city,
        postal_code: values.postal_code,
        country: values.country
      };
      
      await savePersonalInfo.mutateAsync(formData);
      console.log("Successfully saved personal info, moving to document verification tab");
      setActiveTab("document-verification");
    } catch (error) {
      console.error("Error saving personal info:", error);
      toast.error("Failed to save personal information");
    }
  };

  const handleDocumentUpload = async (
    file: File, 
    type: 'id_front' | 'id_back' | 'selfie'
  ) => {
    try {
      console.log(`Uploading ${type} document:`, file.name);
      await uploadDocument.mutateAsync({ file, type });
      toast.success(`${type.replace('_', ' ')} uploaded successfully`);
      
      // Force a refetch to update UI with new document status
      await refetch();
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type.replace('_', ' ')}`);
    }
  };

  const handleFinalSubmit = useCallback(async () => {
    if (!kycData) {
      toast.error("KYC data not found. Please try again.");
      return;
    }
    
    if (!kycData.id_front_url || !kycData.id_back_url || !kycData.selfie_url) {
      toast.error("Please upload all required documents.");
      return;
    }

    console.log("Starting KYC submission process...");
    setIsSubmitting(true);

    try {
      console.log("Calling submitVerification.mutateAsync()");
      await submitVerification.mutateAsync();
      
      // Show explicit success message to the user
      toast.success("Your verification has been submitted successfully! We will review it shortly.");
      
      console.log("Verification submitted successfully, updating tab...");
      
      // Force an immediate refetch to get the updated status
      await refetch();
      
      // Force the tab change to verification-status
      setActiveTab("verification-status");
      
    } catch (error) {
      console.error("Error submitting verification:", error);
      toast.error("An error occurred while submitting your verification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [kycData, submitVerification, refetch]);

  const handleStartVerification = () => {
    setActiveTab("personal-info");
  };

  const handleProvideMoreInfo = () => {
    // Reset clarification message when user decides to provide more info
    if (kycData && kycData.clarification_message) {
      // This will be implemented in a future update
      // For now, just take them back to personal info
      toast.info("Please update your information and resubmit your verification");
      setActiveTab("personal-info");
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger 
          value="personal-info" 
          disabled={kycData?.status === 'pending'}
        >
          Personal Information
        </TabsTrigger>
        <TabsTrigger 
          value="document-verification" 
          disabled={kycData?.status === 'pending' || (!kycData?.first_name && activeTab === "personal-info")}
        >
          Document Verification
        </TabsTrigger>
        <TabsTrigger 
          value="verification-status"
        >
          Verification Status
        </TabsTrigger>
      </TabsList>
      
      <PersonalInfoTab 
        kycData={kycData}
        isPending={savePersonalInfo.isPending}
        onSubmit={handlePersonalInfoSubmit}
      />
      
      <DocumentVerificationTab 
        kycData={kycData}
        uploadPending={uploadDocument.isPending}
        isSubmitting={isSubmitting}
        onBack={() => setActiveTab("personal-info")}
        onSubmit={handleFinalSubmit}
        onUpload={handleDocumentUpload}
      />
      
      <VerificationStatusTab 
        kycData={kycData}
        isLoading={isLoading}
        refetch={refetch}
        onStartVerification={handleStartVerification}
        onProvideMoreInfo={handleProvideMoreInfo}
      />
    </Tabs>
  );
};

export default KYCTabs;
