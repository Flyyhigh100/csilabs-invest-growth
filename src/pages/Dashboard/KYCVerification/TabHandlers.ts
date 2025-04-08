
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

  // Handler for personal info form submission
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
      
      // Move to the next tab
      setActiveTab('documents');
    } catch (error) {
      console.error('Error saving personal info:', error);
      dismissToast('personal-info-toast');
      showErrorToast(`Failed to save personal information: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for document uploads
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
      
      // Refresh the data to show the updated document status
      refetch();
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      dismissToast(toastId);
      showErrorToast(`Failed to upload ${type.replace('_', ' ')}: ${(error as Error).message}`);
    }
  };

  // Track last submission to prevent duplicate submissions
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  
  // Handler for verification submission
  const handleVerificationSubmit = async () => {
    if (!user) {
      showErrorToast('You must be logged in to submit verification');
      return;
    }

    // Prevent duplicate submissions (debounce)
    const now = Date.now();
    if (now - lastSubmissionTime < 5000) {  // Increased debounce time to 5 seconds
      console.log('Preventing duplicate submission, please wait...');
      toast.info('Please wait, submission in progress...');
      return;
    }
    setLastSubmissionTime(now);
    
    setIsSubmitting(true);
    setDebugInfo(prev => ({
      ...prev,
      lastAttempt: new Date().toISOString(),
      attempts: prev.attempts + 1,
      currentStatus: 'submitting'
    }));
    
    const submissionToastId = 'kyc-submission-toast';
    showLoadingToast('Submitting verification...', submissionToastId);
    
    try {
      console.log('🚀 Submitting verification...');
      
      // Force a refetch before submission to ensure we have the latest data
      await refetch();
      
      // Get the current status before submission
      const beforeStatus = kycData?.status;
      console.log('📊 Status before submission:', beforeStatus);
      
      // Execute submission with timeout handling
      let submissionTimeout: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        submissionTimeout = setTimeout(() => {
          reject(new Error('Submission timed out after 15 seconds'));
        }, 15000);
      });
      
      const submissionPromise = submitVerification.mutateAsync();
      
      // Race between the submission and the timeout
      const result = await Promise.race([submissionPromise, timeoutPromise]);
      
      // Clear timeout if submission completed
      if (submissionTimeout) {
        clearTimeout(submissionTimeout);
      }
      
      console.log('📝 Verification submission result:', result);
      
      // Update debug info
      setDebugInfo(prev => ({
        ...prev,
        lastResult: result,
        currentStatus: result ? 'pending' : 'failed'
      }));
      
      if (result) {
        dismissToast(submissionToastId);
        showSuccessToast('Verification submitted successfully!');
        
        // Force multiple refetches with increasing delays to ensure we get the updated status
        await refetch();
        
        setTimeout(async () => {
          console.log('🔄 First delayed refetch...');
          await refetch();
          
          // Get the current status after first refetch
          const { data } = await supabase
            .from('kyc_verifications')
            .select('status')
            .eq('user_id', user.id)
            .single();
            
          console.log('📊 Status after first refetch:', data?.status);
          
          setTimeout(async () => {
            console.log('🔄 Second delayed refetch...');
            await refetch();
            
            // Move to the status tab with a delay
            console.log('📱 Moving to status tab...');
            setActiveTab('status');
          }, 1000);
        }, 500);
      } else {
        dismissToast(submissionToastId);
        showErrorToast('Error submitting verification');
        setDebugInfo(prev => ({
          ...prev,
          currentStatus: 'error'
        }));
      }
    } catch (error) {
      console.error('❌ Error submitting verification:', error);
      dismissToast(submissionToastId);
      showErrorToast(`Failed to submit verification: ${(error as Error).message}`);
      setDebugInfo(prev => ({
        ...prev,
        lastResult: { error: (error as Error).message },
        currentStatus: 'error'
      }));
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
    uploadPending: uploadDocument.isPending,
    debugInfo
  };
};

export default TabHandlers;
