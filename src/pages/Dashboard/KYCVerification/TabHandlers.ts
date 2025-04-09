
import { useState } from 'react';
import { KycVerificationData } from '@/hooks/kyc/types';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import { useAuth } from '@/contexts/AuthContext';
import { PersonalInfoValues } from '@/components/KYC/schema/personalInfoSchema';
import { toast } from 'sonner';

export interface DebugInfo {
  currentStatus: string | null | undefined;
  lastAttempt?: string | null;
  submissionDebug?: any;
  attempts?: number;
  errors?: any[];
  apiResponses?: any[];
}

const TabHandlers = (
  kycData: KycVerificationData | null,
  setActiveTab: (tab: string) => void
) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    currentStatus: kycData?.status,
    attempts: 0,
    errors: [],
    apiResponses: []
  });
  
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
      
      // Update debug info
      setDebugInfo(prev => ({
        ...prev,
        lastAttempt: new Date().toISOString(),
        currentStatus: kycData?.status
      }));
      
      toast.success("KYC status refreshed");
      return true;
    } catch (error) {
      console.error("❌ Error refreshing KYC status:", error);
      
      // Update debug info with error
      setDebugInfo(prev => ({
        ...prev,
        lastAttempt: new Date().toISOString(),
        errors: [...(prev.errors || []), {
          type: 'refresh_error',
          message: (error as Error).message,
          timestamp: new Date().toISOString()
        }]
      }));
      
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
      
      // Create a KYC form data object with correct property names (snake_case)
      const kycFormData = {
        first_name: values.first_name,
        last_name: values.last_name,
        date_of_birth: values.date_of_birth,
        nationality: values.nationality,
        address: values.address,
        city: values.city,
        postal_code: values.postal_code,
        country: values.country
      };
      
      const response = await savePersonalInfo.mutateAsync(kycFormData);
      
      // Store response in debug info
      setDebugInfo(prev => ({
        ...prev,
        apiResponses: [...(prev.apiResponses || []), {
          type: 'personal_info_save',
          data: response,
          timestamp: new Date().toISOString()
        }]
      }));
      
      toast.success('Personal information saved successfully');
      
      // Move to the next tab
      setActiveTab('documents');
    } catch (error) {
      console.error('Error saving personal info:', error);
      
      // Update debug info with error
      setDebugInfo(prev => ({
        ...prev,
        errors: [...(prev.errors || []), {
          type: 'personal_info_error',
          message: (error as Error).message,
          stack: (error as Error).stack,
          timestamp: new Date().toISOString()
        }]
      }));
      
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
      const response = await uploadDocument.mutateAsync({ file, type });
      
      // Store response in debug info
      setDebugInfo(prev => ({
        ...prev,
        apiResponses: [...(prev.apiResponses || []), {
          type: `document_upload_${type}`,
          data: response,
          timestamp: new Date().toISOString()
        }]
      }));
      
      toast.success(`${type.replace('_', ' ')} uploaded successfully`);
      
      // Refresh the data to show the updated document status
      refetch();
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      
      // Update debug info with error
      setDebugInfo(prev => ({
        ...prev,
        errors: [...(prev.errors || []), {
          type: `document_upload_error_${type}`,
          message: (error as Error).message,
          stack: (error as Error).stack,
          timestamp: new Date().toISOString()
        }]
      }));
      
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
    setDebugInfo(prev => ({
      ...prev,
      attempts: (prev.attempts || 0) + 1,
      lastAttempt: new Date().toISOString()
    }));
    
    try {
      console.log('Submitting verification...');
      const result = await submitVerification.mutateAsync();
      
      // Capture detailed debug information
      setDebugInfo(prev => ({
        ...prev,
        submissionDebug: result,
        currentStatus: 'pending', // Optimistic update
        apiResponses: [...(prev.apiResponses || []), {
          type: 'verification_submission',
          data: result,
          timestamp: new Date().toISOString()
        }]
      }));
      
      console.log('Verification submission result:', result);
      
      toast.success('Verification submitted successfully!');
      
      // Move to the status tab
      setActiveTab('status');
    } catch (error) {
      console.error('Error submitting verification:', error);
      
      // Update debug info with error
      setDebugInfo(prev => ({
        ...prev,
        errors: [...(prev.errors || []), {
          type: 'verification_submission_error',
          message: (error as Error).message,
          stack: (error as Error).stack,
          timestamp: new Date().toISOString()
        }]
      }));
      
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
    handleDocumentUpload,
    handleVerificationSubmit,
    handleRestartVerification,
    handleManualStatusRefresh,
    isSubmitting,
    uploadPending: uploadDocument.isPending,
    debugInfo: {
      ...debugInfo,
      currentStatus: kycData?.status
    }
  };
};

export default TabHandlers;
