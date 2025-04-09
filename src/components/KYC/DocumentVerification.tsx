
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Import components
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
  const [submissionAttemptTime, setSubmissionAttemptTime] = useState<number | null>(null);

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
          .maybeSingle();
          
        if (data) {
          setLiveStatus(data.status || null);
          setLastRefresh(new Date().toISOString());
          
          // If status has changed to pending, update our local state
          if (data.status === 'pending' || data.submitted_at) {
            setSubmissionStatus('success');
            setIsAttemptingSubmit(false);
            setIsButtonLocked(false);
            
            console.log("🔄 Live status check found pending status:", data);
            
            // If this happened during a submission attempt, show success message
            if (submissionAttemptTime && Date.now() - submissionAttemptTime < 60000) {
              toast.success("Verification submitted successfully!");
            }
          }
        }
      } catch (error) {
        console.error('Failed to check live status:', error);
      }
    };
    
    // Check immediately
    checkLiveStatus();
    
    // Set up interval - check every 3 seconds
    const interval = setInterval(checkLiveStatus, 3000);
    
    return () => clearInterval(interval);
  }, [user?.id, submissionAttemptTime]);

  const handleSubmitClick = async () => {
    // Prevent multiple submissions
    if (isButtonLocked) {
      toast.info("Submission in progress, please wait...");
      return;
    }
    
    // Check for all required documents
    if (!hasIdFront || !hasIdBack || !hasSelfie) {
      toast.error("Please upload all required documents before submitting");
      return;
    }
    
    // Lock the button to prevent multiple clicks
    setIsButtonLocked(true);
    setSubmissionAttemptTime(Date.now());
    
    // Debug - log the state at button click
    console.log("🎯 Submit button clicked, starting submission process...");
    console.log("📋 Current document states:", { hasIdFront, hasIdBack, hasSelfie });
    
    // Set local state to show immediate feedback
    setIsAttemptingSubmit(true);
    setSubmissionStatus('submitting');
    
    try {
      // Clear any existing toasts
      toast.dismiss();
      toast.loading("Submitting verification...");
      
      console.log("📞 Calling onSubmit function");
      await onSubmit();
      
      // We don't immediately set success here anymore - we'll wait for the live status check
      // to confirm the database update was successful
      
      // Set a timeout to check if submission succeeded
      setTimeout(async () => {
        if (submissionStatus === 'submitting' && user?.id) {
          // Do a manual check if the status update worked
          const { data } = await supabase
            .from('kyc_verifications')
            .select('status, submitted_at')
            .eq('user_id', user.id)
            .maybeSingle();
            
          console.log("⏱️ Timeout check for submission result:", data);
          
          if (data?.status === 'pending' || data?.submitted_at) {
            // Database update was successful
            setSubmissionStatus('success');
            toast.dismiss();
            toast.success("Verification submitted successfully!");
          } else {
            // Database update failed
            setSubmissionStatus('error');
            toast.dismiss();
            toast.error("Submission may have failed. Please check status or try again.");
            // Unlock button after delay
            setTimeout(() => setIsButtonLocked(false), 5000);
          }
        }
      }, 5000); // Check after 5 seconds
      
    } catch (error) {
      console.error("❌ Error in submission:", error);
      setSubmissionStatus('error');
      toast.dismiss();
      toast.error("Failed to submit verification. Please try again.");
      
      // Reset attempting submit state so user can try again
      setIsAttemptingSubmit(false);
      setIsButtonLocked(false);
    }
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
      
      // If status is pending, update submission status
      if (data?.status === 'pending' || data?.submitted_at) {
        setSubmissionStatus('success');
      }
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
