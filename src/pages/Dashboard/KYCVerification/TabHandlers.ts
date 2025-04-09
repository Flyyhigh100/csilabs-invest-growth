
import { useState } from 'react';
import { KycVerificationData } from '@/hooks/kyc/types';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import { useAuth } from '@/contexts/AuthContext';
import { PersonalInfoValues } from '@/components/KYC/schema/personalInfoSchema';
import { 
  showLoadingToast, 
  dismissToast, 
  showSuccessToast, 
  showErrorToast,
  showInfoToast
} from '@/utils/admin/kyc/verification/utils/toastManager';
import { supabase } from '@/integrations/supabase/client';

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
      
      await refetch();
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      dismissToast(toastId);
      showErrorToast(`Failed to upload ${type.replace('_', ' ')}: ${(error as Error).message}`);
    }
  };

  // Handle verification submission - simplified approach
  const handleVerificationSubmit = async () => {
    if (!user) {
      showErrorToast('You must be logged in to submit verification');
      return;
    }
    
    // Prevent duplicate submissions
    if (isSubmitting) {
      showInfoToast('Already submitting, please wait...');
      return;
    }
    
    setIsSubmitting(true);
    setDebugInfo(prev => ({
      ...prev,
      lastAttempt: new Date().toISOString(),
      attempts: prev.attempts + 1,
      currentStatus: 'submitting'
    }));
    
    // Clear any existing toasts
    dismissToast('kyc-submission');
    showLoadingToast('Submitting your verification...', 'kyc-submission');
    
    try {
      console.log('🚀 Starting KYC submission process');
      
      // Step 1: Submit the verification (this updates status to pending)
      const result = await submitVerification.mutateAsync();
      console.log('📝 Verification submission result:', result);
      
      if (result) {
        setDebugInfo(prev => ({
          ...prev,
          lastResult: { success: true },
          currentStatus: 'pending'
        }));
        
        dismissToast('kyc-submission');
        showSuccessToast('Verification submitted successfully!');
        
        // Force multiple refreshes to ensure we get the updated data
        console.log('🔄 Refreshing data after submission');
        await refetch();
        
        // Schedule additional refreshes with increasing delays
        setTimeout(() => refetch(), 1000);
        setTimeout(() => refetch(), 3000);
        
        // Move to status tab
        setActiveTab('status');
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('❌ Error in verification submission:', error);
      dismissToast('kyc-submission');
      showErrorToast(`Submission error: ${(error as Error).message}`);
      
      setDebugInfo(prev => ({
        ...prev,
        lastResult: { error: (error as Error).message },
        currentStatus: 'error'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add manual refresh function
  const handleManualStatusRefresh = async () => {
    if (!user?.id) {
      showErrorToast('Authentication error');
      return;
    }
    
    showLoadingToast('Refreshing status...', 'refresh-status');
    
    try {
      console.log('🔄 Manually refreshing KYC status');
      
      // Direct database query to get the latest status
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      console.log('📊 Latest KYC status from database:', data?.status);
      setDebugInfo(prev => ({
        ...prev,
        currentStatus: data?.status || null
      }));
      
      // Force a refetch of KYC data
      await refetch();
      
      dismissToast('refresh-status');
      showSuccessToast('Status refreshed successfully');
      
      // If status is pending, move to status tab
      if (data?.status === 'pending') {
        setActiveTab('status');
      }
    } catch (error) {
      console.error('Error refreshing status:', error);
      dismissToast('refresh-status');
      showErrorToast(`Failed to refresh status: ${(error as Error).message}`);
    }
  };

  const handleRestartVerification = async () => {
    await refetch();
    setActiveTab('personal-info');
  };

  return {
    handlePersonalInfoSubmit,
    handleDocumentUpload,
    handleVerificationSubmit,
    handleRestartVerification,
    handleManualStatusRefresh, // New manual refresh function
    isSubmitting,
    uploadPending: uploadDocument.isPending,
    debugInfo
  };
};

export default TabHandlers;
