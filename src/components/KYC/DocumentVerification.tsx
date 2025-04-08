
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DocumentUpload from './DocumentUpload';
import { AlertCircle, Bug } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
    // Debug - log the state at button click
    console.log("🎯 Submit button clicked, starting submission process...");
    console.log("📋 Current document states:", { hasIdFront, hasIdBack, hasSelfie });
    console.log("⚙️ Current process states:", { isPending, isSubmitting, isAttemptingSubmit });
    
    // Validation check - should never happen due to button disabled state, but double-checking
    if (!hasIdFront || !hasIdBack || !hasSelfie) {
      toast.error("Please upload all required documents before submitting");
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
    } catch (error) {
      console.error("Failed to refresh status:", error);
      toast.error("Failed to refresh status");
    }
  };

  // Combined submission state for UI feedback
  const showSubmitSpinner = isSubmitting || (isAttemptingSubmit && submissionStatus === 'submitting');
  const isButtonDisabled = !hasIdFront || !hasIdBack || !hasSelfie || showSubmitSpinner || isPending;

  return (
    <div className="space-y-6">
      {clarificationMessage && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Additional Information Requested</h4>
              <p className="text-blue-700 text-sm mt-1">{clarificationMessage}</p>
              <p className="text-sm text-blue-600 mt-2">
                Please review the message above and re-upload your documents.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Debug Info Panel */}
      <div className="bg-gray-100 border border-gray-300 rounded-md p-4 mb-4">
        <div className="flex items-center mb-2">
          <Bug className="h-5 w-5 text-gray-700 mr-2" />
          <h4 className="font-medium text-gray-800">Debug Information</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
          <div><strong>Live Status:</strong> {liveStatus || 'unknown'}</div>
          <div><strong>Last Refreshed:</strong> {lastRefresh ? new Date(lastRefresh).toLocaleTimeString() : 'never'}</div>
          <div><strong>Is Pending:</strong> {isPending ? 'true' : 'false'}</div>
          <div><strong>Is Submitting:</strong> {isSubmitting ? 'true' : 'false'}</div>
          <div><strong>Local Status:</strong> {submissionStatus}</div>
          <div><strong>Attempting Submit:</strong> {isAttemptingSubmit ? 'true' : 'false'}</div>
          {debugInfo && (
            <>
              <div className="col-span-1 sm:col-span-2 pt-2 border-t border-gray-300">
                <strong>Additional Debug Info:</strong>
              </div>
              <div><strong>Attempts:</strong> {debugInfo.attempts || 0}</div>
              <div><strong>Last Attempt:</strong> {debugInfo.lastAttempt ? new Date(debugInfo.lastAttempt).toLocaleTimeString() : 'none'}</div>
              <div className="col-span-1 sm:col-span-2">
                <strong>Debug Status:</strong> {debugInfo.currentStatus || 'none'}
              </div>
            </>
          )}
        </div>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          className="mt-3"
          onClick={handleManualRefresh}
        >
          Refresh Status
        </Button>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">ID Verification</h3>
        <p className="text-sm text-gray-500 mb-4">
          Please upload clear images of your ID document (both sides) and a selfie.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DocumentUpload
            documentType="id_front"
            title="Front of ID"
            isUploaded={hasIdFront}
            isPending={isPending}
            onUpload={onUpload}
          />
          
          <DocumentUpload
            documentType="id_back"
            title="Back of ID"
            isUploaded={hasIdBack}
            isPending={isPending}
            onUpload={onUpload}
          />
          
          <DocumentUpload
            documentType="selfie"
            title="Selfie with ID"
            isUploaded={hasSelfie}
            isPending={isPending}
            onUpload={onUpload}
          />
        </div>
      </div>
      
      <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
        <Button 
          type="button" 
          variant="outline"
          onClick={onBack}
          disabled={showSubmitSpinner || submissionStatus === 'success'}
        >
          Back
        </Button>
        <Button 
          type="button"
          disabled={isButtonDisabled || submissionStatus === 'success'}
          onClick={handleSubmitClick}
          className="relative"
        >
          {showSubmitSpinner ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin inline-block border-2 border-current border-t-transparent rounded-full"></span>
              Submitting...
            </>
          ) : submissionStatus === 'success' ? (
            "Submitted Successfully"
          ) : (
            "Submit Verification"
          )}
        </Button>
      </div>
      
      {submissionStatus === 'success' && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-sm">
            Your verification has been submitted successfully and is now pending review.
            You will be redirected to the status page shortly.
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentVerification;
