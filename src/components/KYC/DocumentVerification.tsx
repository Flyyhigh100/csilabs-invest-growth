
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Import newly created components
import DebugPanel from './components/DebugPanel';
import ClarificationMessage from './components/ClarificationMessage';
import DocumentsSection from './components/DocumentsSection';
import SubmissionControls from './components/SubmissionControls';
import SuccessMessage from './components/SuccessMessage';

interface DocumentVerificationProps {
  hasIdFront: boolean;
  hasIdBack: boolean;
  hasSelfie: boolean;
  isPending: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  onUpload: (file: File, type: 'id_front' | 'id_back' | 'selfie') => Promise<void>;
  clarificationMessage?: string | null;
  debugInfo?: any;
}

const DocumentVerification: React.FC<DocumentVerificationProps> = ({
  hasIdFront,
  hasIdBack,
  hasSelfie,
  isPending,
  isSubmitting,
  onBack,
  onSubmit,
  onUpload,
  clarificationMessage,
  debugInfo
}) => {
  const { user } = useAuth();
  // Local state to track submission attempts and status
  const [isAttemptingSubmit, setIsAttemptingSubmit] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [isButtonLocked, setIsButtonLocked] = useState(false);

  // Reset submission status when component mounts or isPending changes
  useEffect(() => {
    if (isPending) {
      setSubmissionStatus('success'); // If we're already pending, we've successfully submitted
    } else {
      setSubmissionStatus('idle');
      setIsAttemptingSubmit(false);
    }
  }, [isPending]);
  
  // Live status checking
  useEffect(() => {
    if (!user?.id) return;
    
    const checkLiveStatus = async () => {
      try {
        const { data } = await supabase
          .from('kyc_verifications')
          .select('status, submitted_at')
          .eq('user_id', user.id)
          .single();
          
        setLiveStatus(data?.status || null);
        setLastRefresh(new Date().toISOString());
        
        // If status has changed to pending, update our local state
        if (data?.status === 'pending') {
          setSubmissionStatus('success');
          setIsAttemptingSubmit(false);
          setIsButtonLocked(false);
        }
      } catch (error) {
        console.error('Failed to check live status:', error);
      }
    };
    
    // Check immediately
    checkLiveStatus();
    
    // Set up interval
    const interval = setInterval(checkLiveStatus, 3000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleSubmitClick = async () => {
    if (isButtonLocked) {
      toast.info("Submission in progress, please wait...");
      return;
    }
    
    // Lock the button to prevent multiple clicks
    setIsButtonLocked(true);
    
    // Debug - log the state at button click
    console.log("🎯 Submit button clicked, starting submission process...");
    console.log("📋 Current document states:", { hasIdFront, hasIdBack, hasSelfie });
    console.log("⚙️ Current process states:", { isPending, isSubmitting, isAttemptingSubmit });
    
    // Validation check - should never happen due to button disabled state, but double-checking
    if (!hasIdFront || !hasIdBack || !hasSelfie) {
      toast.error("Please upload all required documents before submitting");
      setIsButtonLocked(false);
      return;
    }
    
    // Set local state to show immediate feedback
    setIsAttemptingSubmit(true);
    setSubmissionStatus('submitting');
    
    try {
      toast.info("Submitting verification...");
      console.log("📞 Calling onSubmit function");
      await onSubmit();
      console.log("✅ Submission completed successfully");
      setSubmissionStatus('success');
      toast.success("Verification submitted successfully!");
    } catch (error) {
      console.error("❌ Error in submission:", error);
      setSubmissionStatus('error');
      toast.error("Failed to submit verification. Please try again.");
      // Reset attempting submit state so user can try again
      setIsAttemptingSubmit(false);
      setIsButtonLocked(false);
    }
    
    // Unlock button after a delay to prevent immediate resubmissions
    setTimeout(() => {
      setIsButtonLocked(false);
    }, 5000);
  };

  const handleManualRefresh = async () => {
    try {
      toast.info("Manually refreshing status...");
      
      if (!user?.id) {
        toast.error("User not authenticated");
        return;
      }
      
      const { data } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      console.log("🔍 Manual refresh - KYC data:", data);
      setLiveStatus(data?.status || null);
      setLastRefresh(new Date().toISOString());
      toast.success("Status refreshed");
    } catch (error) {
      console.error("Failed to refresh status:", error);
      toast.error("Failed to refresh status");
    }
  };

  // Combined submission state for UI feedback
  const showSubmitSpinner = isSubmitting || (isAttemptingSubmit && submissionStatus === 'submitting');
  const isButtonDisabled = !hasIdFront || !hasIdBack || !hasSelfie || showSubmitSpinner || isPending || isButtonLocked;

  return (
    <div className="space-y-6">
      <ClarificationMessage message={clarificationMessage} />
      
      <DebugPanel 
        liveStatus={liveStatus}
        lastRefresh={lastRefresh}
        isPending={isPending}
        isSubmitting={isSubmitting}
        submissionStatus={submissionStatus}
        isAttemptingSubmit={isAttemptingSubmit}
        debugInfo={debugInfo}
        onRefresh={handleManualRefresh}
      />
      
      <DocumentsSection 
        hasIdFront={hasIdFront}
        hasIdBack={hasIdBack}
        hasSelfie={hasSelfie}
        isPending={isPending}
        onUpload={onUpload}
      />
      
      <SubmissionControls 
        isButtonDisabled={isButtonDisabled}
        isSubmitting={showSubmitSpinner}
        submissionStatus={submissionStatus}
        onBack={onBack}
        onSubmit={handleSubmitClick}
      />
      
      <SuccessMessage show={submissionStatus === 'success'} />
    </div>
  );
};

export default DocumentVerification;
