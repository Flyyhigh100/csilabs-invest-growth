
import { useState } from 'react';
import { KycVerificationData } from '@/hooks/kyc/types';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useDebugInfo, 
  useStatusRefresh, 
  useFormSubmitHandlers, 
  useDocumentHandlers, 
  useVerificationRestart, 
  DebugInfo 
} from './hooks';

const TabHandlers = (
  kycData: KycVerificationData | null,
  setActiveTab: (tab: string) => void
) => {
  const { user } = useAuth();
  const { debugInfo, setDebugInfo } = useDebugInfo(kycData?.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    savePersonalInfo, 
    uploadDocument, 
    submitVerification, 
    refetch 
  } = useKycVerification();

  // Helper function to update debug info
  const updateDebugInfo = (updates: Partial<DebugInfo> | ((prev: any) => any)) => {
    if (typeof updates === 'function') {
      setDebugInfo(prev => ({
        ...prev,
        ...updates(prev)
      }));
    } else {
      setDebugInfo(prev => ({
        ...prev,
        ...updates
      }));
    }
  };
  
  // Use modular hooks to handle different actions
  const handleManualStatusRefresh = useStatusRefresh(
    user?.id, 
    refetch, 
    updateDebugInfo,
    kycData?.status
  );
  
  const { 
    handlePersonalInfoSubmit 
  } = useFormSubmitHandlers(
    refetch,
    savePersonalInfo,
    setActiveTab,
    updateDebugInfo
  );
  
  const { 
    handleDocumentUpload, 
    handleVerificationSubmit 
  } = useDocumentHandlers(
    uploadDocument,
    submitVerification,
    refetch,
    setActiveTab,
    updateDebugInfo,
    setIsSubmitting
  );
  
  const { 
    handleRestartVerification 
  } = useVerificationRestart(refetch, setActiveTab);

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
