
import { useState } from 'react';
import { KycVerificationData } from '@/hooks/kyc/types';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import { useAuth } from '@/contexts/AuthContext';
import { PersonalInfoValues } from '@/components/KYC/schema/personalInfoSchema';
import { toast } from 'sonner';

export const TabHandlers = (
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

  // Handler for personal info form submission
  const handlePersonalInfoSubmit = async (values: PersonalInfoValues) => {
    if (!user) {
      toast.error('You must be logged in to complete verification');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('💾 Submitting personal info:', values);
      await savePersonalInfo.mutateAsync(values);
      toast.success('Personal information saved successfully');
      
      // Move to the next tab
      setActiveTab('documents');
    } catch (error) {
      console.error('❌ Error saving personal info:', error);
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
      console.log(`📤 Uploading ${type} document...`);
      await uploadDocument.mutateAsync({ file, type });
      toast.success(`${type.replace('_', ' ')} uploaded successfully`);
      
      // Refresh the data to show the updated document status
      refetch();
    } catch (error) {
      console.error(`❌ Error uploading ${type}:`, error);
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
    
    // Create a unique ID for this toast
    const submitToastId = 'submit-verification-toast';
    
    try {
      console.log('🚀 Starting verification submission...');
      
      // Show persistent toast while submitting
      toast.loading('Submitting verification...', { id: submitToastId });
      
      const result = await submitVerification.mutateAsync();
      console.log('✅ Verification submitted successfully:', result);
      
      // Clear loading toast and show success
      toast.dismiss(submitToastId);
      toast.success('Verification submitted successfully!');
      
      // Force a refetch of the KYC status to ensure we have the latest data
      await refetch();
      
      console.log('🔄 Navigating to status tab after successful submission');
      
      // Set a small delay to ensure state updates are processed
      setTimeout(() => {
        // Navigate to the status tab
        setActiveTab('status');
        
        // Perform one more refetch for good measure
        refetch();
      }, 300);
    } catch (error) {
      console.error('❌ Error submitting verification:', error);
      
      // Clear loading toast and show error
      toast.dismiss(submitToastId);
      toast.error(`Failed to submit verification: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for restarting verification
  const handleRestartVerification = async () => {
    // Refresh the data first
    await refetch();
    
    // Navigate back to the personal info tab
    setActiveTab('personal-info');
  };

  return {
    handlePersonalInfoSubmit,
    handleDocumentUpload,
    handleVerificationSubmit,
    handleRestartVerification,
    isSubmitting,
    uploadPending: uploadDocument.isPending
  };
};

export default TabHandlers;
