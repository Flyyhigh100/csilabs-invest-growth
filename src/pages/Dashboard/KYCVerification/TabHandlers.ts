import { useState } from 'react';
import { KycVerificationData } from '@/hooks/kyc/types';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import { useAuth } from '@/contexts/AuthContext';
import { PersonalInfoValues } from '@/components/KYC/schema/personalInfoSchema';
import { toast } from 'sonner';

const TabHandlers = (
  kycData: KycVerificationData | null,
  setActiveTab: (tab: string) => void
) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { 
    savePersonalInfo, 
    uploadDocument, 
    submitVerification, 
    refetch 
  } = useKycVerification();
  
  // Handler for manual status refresh
  const handleManualStatusRefresh = async () => {
    if (!user?.id) {
      toast.error("Authentication required");
      return false;
    }
    
    try {
      toast.info("Manually refreshing KYC status...");
      console.log("🔄 Manual refresh initiated by user");
      
      // Force multiple refreshes to ensure we get the latest data
      await refetch();
      console.log("✅ KYC data refreshed");
      
      toast.success("KYC status refreshed");
      return true;
    } catch (error) {
      console.error("❌ Error refreshing KYC status:", error);
      toast.error("Failed to refresh status");
      return false;
    }
  };

  // Handler for personal info form submission
  const handlePersonalInfoSubmit = async (values: PersonalInfoValues) => {
    if (!user) {
      toast.error('You must be logged in to complete verification');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting personal info:', values);
      await savePersonalInfo.mutateAsync(values);
      toast.success('Personal information saved successfully');
      
      // Move to the next tab
      setActiveTab('documents');
    } catch (error) {
      console.error('Error saving personal info:', error);
      toast.error(`Failed to save personal information: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for document uploads
  const handleDocumentUpload = async (file: File, type: 'id_front' | 'id_back' | 'selfie') => {
    if (!user) {
      toast.error('You must be logged in to upload documents');
      return;
    }

    try {
      console.log(`Uploading ${type} document...`);
      await uploadDocument.mutateAsync({ file, type });
      toast.success(`${type.replace('_', ' ')} uploaded successfully`);
      
      // Refresh the data to show the updated document status
      refetch();
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type.replace('_', ' ')}: ${(error as Error).message}`);
    }
  };

  // Handler for verification submission
  const handleVerificationSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in to submit verification');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting verification...');
      await submitVerification.mutateAsync();
      toast.success('Verification submitted successfully!');
      
      // Move to the status tab
      setActiveTab('status');
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error(`Failed to submit verification: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for restarting verification
  const handleRestartVerification = async () => {
    // Simply navigate back to the personal info tab
    // The user will need to fill out the information again
    refetch();
    setActiveTab('personal-info');
  };

  return {
    handlePersonalInfoSubmit,
    handleDocumentUpload: uploadDocument.mutate,
    handleVerificationSubmit,
    handleRestartVerification,
    handleManualStatusRefresh,
    isSubmitting,
    uploadPending: uploadDocument.isPending,
    debugInfo: {
      currentStatus: kycData?.status
    }
  };
};

export default TabHandlers;
