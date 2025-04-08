import { useState } from 'react';
import { KycVerificationData } from '@/hooks/kyc/types';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import { useAuth } from '@/contexts/AuthContext';
import { PersonalInfoValues } from '@/components/KYC/schema/personalInfoSchema';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  showLoadingToast, 
  dismissToast, 
  showSuccessToast, 
  showErrorToast 
} from '@/utils/admin/kyc/verification/utils/toastManager';

const TabHandlers = (
  kycData: KycVerificationData | null,
  setActiveTab: (tab: string) => void
) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    lastAttempt: string | null,
    attempts: number,
    lastResult: any | null,
    currentStatus: string | null
  }>({
    lastAttempt: null,
    attempts: 0,
    lastResult: null,
    currentStatus: kycData?.status || null
  });
  
  const { 
    savePersonalInfo, 
    uploadDocument, 
    submitVerification, 
    refetch 
  } = useKycVerification();

  const handlePersonalInfoSubmit = async (values: PersonalInfoValues) => {
    if (!user) {
      showErrorToast('You must be logged in to complete verification');
      return;
    }

    setIsSubmitting(true);
    showLoadingToast('Saving your personal information...', 'personal-info-toast');
    
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
      
      dismissToast('personal-info-toast');
      showSuccessToast('Personal information saved successfully');
      
      setActiveTab('documents');
    } catch (error) {
      console.error('Error saving personal info:', error);
      dismissToast('personal-info-toast');
      showErrorToast(`Failed to save personal information: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentUpload = async (file: File, type: 'id_front' | 'id_back' | 'selfie') => {
    if (!user) {
      showErrorToast('You must be logged in to upload documents');
      return;
    }

    const toastId = `upload-${type}-toast`;
    showLoadingToast(`Uploading ${type.replace('_', ' ')}...`, toastId);
    
    try {
      console.log(`Uploading ${type} document...`);
      await uploadDocument.mutateAsync({ file, type });
      
      dismissToast(toastId);
      showSuccessToast(`${type.replace('_', ' ')} uploaded successfully`);
      
      refetch();
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      dismissToast(toastId);
      showErrorToast(`Failed to upload ${type.replace('_', ' ')}: ${(error as Error).message}`);
    }
  };

  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  const [submissionAttemptCount, setSubmissionAttemptCount] = useState(0);
  
  const handleVerificationSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in to submit verification');
      return;
    }

    const now = Date.now();
    if (now - lastSubmissionTime < 8000) {
      console.log('Preventing duplicate submission, please wait...');
      toast.info('Please wait, submission in progress...');
      return;
    }
    
    setLastSubmissionTime(now);
    setSubmissionAttemptCount(prev => prev + 1);
    
    setIsSubmitting(true);
    setDebugInfo(prev => ({
      ...prev,
      lastAttempt: new Date().toISOString(),
      attempts: prev.attempts + 1,
      currentStatus: 'submitting'
    }));
    
    toast.dismiss();
    
    try {
      console.log('🚀 Initiating verification submission...');
      
      await refetch();
      
      const beforeStatus = kycData?.status;
      console.log('📊 Status before submission:', beforeStatus);
      
      const submissionPromise = new Promise<boolean>(async (resolve) => {
        const result = await submitVerification.mutateAsync();
        resolve(result);
      });
      
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Submission timed out after 20 seconds'));
        }, 20000);
      });
      
      const result = await Promise.race([submissionPromise, timeoutPromise]);
      
      console.log('📝 Verification submission completed with result:', result);
      
      setDebugInfo(prev => ({
        ...prev,
        lastResult: result,
        currentStatus: result ? 'pending' : 'error'
      }));
      
      if (result) {
        toast.success('Verification submitted successfully!');
        
        await refetch();
        
        const refetchWithDelay = async (delay: number) => {
          await new Promise(resolve => setTimeout(resolve, delay));
          console.log(`🔄 Refetching KYC data after ${delay}ms delay...`);
          await refetch();
        };
        
        await refetchWithDelay(500);
        await refetchWithDelay(1500);
        await refetchWithDelay(3000);
        
        setActiveTab('status');
        
        return;
      } else {
        console.error('❌ Verification submission returned false');
        toast.error('Verification submission failed. Please try again.');
        setDebugInfo(prev => ({
          ...prev,
          currentStatus: 'error'
        }));
      }
    } catch (error) {
      console.error('❌ Error in verification submission:', error);
      toast.error(`Submission error: ${(error as Error).message}`);
      setDebugInfo(prev => ({
        ...prev,
        lastResult: { error: (error as Error).message },
        currentStatus: 'error'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestartVerification = async () => {
    refetch();
    setActiveTab('personal-info');
  };

  return {
    handlePersonalInfoSubmit,
    handleDocumentUpload,
    handleVerificationSubmit,
    handleRestartVerification,
    isSubmitting,
    uploadPending: uploadDocument.isPending,
    debugInfo,
    submissionAttemptCount
  };
};

export default TabHandlers;
