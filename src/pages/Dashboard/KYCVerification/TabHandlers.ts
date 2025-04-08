
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

  // Handler for personal info form submission
  const handlePersonalInfoSubmit = async (values: PersonalInfoValues) => {
    if (!user) {
      toast.error('You must be logged in to complete verification');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting personal info:', values);
      await savePersonalInfo.mutateAsync({
        first_name: values.first_name,
        last_name: values.last_name,
        date_of_birth: values.date_of_birth,
        nationality: values.nationality,
        address: values.address,
        city: values.city,
        postal_code: values.postal_code,
        country: values.country
      });
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

  // Track last submission to prevent duplicate submissions
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  
  // Handler for verification submission
  const handleVerificationSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in to submit verification');
      return;
    }

    // Prevent duplicate submissions (debounce)
    const now = Date.now();
    if (now - lastSubmissionTime < 3000) {
      console.log('Preventing duplicate submission');
      return;
    }
    setLastSubmissionTime(now);
    
    setIsSubmitting(true);
    try {
      console.log('Submitting verification...');
      toast.info('Submitting verification...');
      
      const result = await submitVerification.mutateAsync();
      console.log('Verification submission result:', result);
      
      if (result) {
        toast.success('Verification submitted successfully!');
        
        // Force an immediate refetch to get the updated status
        await refetch();
        
        // Move to the status tab
        setTimeout(() => {
          setActiveTab('status');
        }, 1000);
      } else {
        toast.error('Error submitting verification');
      }
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
    refetch();
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
