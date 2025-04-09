
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DebugInfo } from './useDebugInfo';

/**
 * Hook to handle document uploads and verification submissions
 */
export const useDocumentHandlers = (
  uploadDocument: any,
  submitVerification: any,
  refetch: () => Promise<any>,
  setActiveTab: (tab: string) => void,
  updateDebugInfo: (updates: Partial<DebugInfo>) => void,
  setIsSubmitting: (isSubmitting: boolean) => void
) => {
  const { user } = useAuth();

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
      updateDebugInfo({
        apiResponses: [{
          type: `document_upload_${type}`,
          data: response,
          timestamp: new Date().toISOString()
        }]
      });
      
      toast.success(`${type.replace('_', ' ')} uploaded successfully`);
      
      // Refresh the data to show the updated document status
      refetch();
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      
      // Update debug info with error
      updateDebugInfo({
        errors: [{
          type: `document_upload_error_${type}`,
          message: (error as Error).message,
          stack: (error as Error).stack,
          timestamp: new Date().toISOString()
        }],
        lastError: {
          message: (error as any).message,
          code: (error as any).code,
          details: (error as any).details,
          hint: (error as any).hint
        }
      });
      
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
    updateDebugInfo({
      attempts: (prev) => (prev || 0) + 1,
      lastAttempt: new Date().toISOString()
    });
    
    try {
      console.log('Submitting verification...');
      const result = await submitVerification.mutateAsync();
      
      // Capture detailed debug information
      updateDebugInfo({
        submissionDebug: result,
        currentStatus: 'pending', // Optimistic update
        apiResponses: [{
          type: 'verification_submission',
          data: result,
          timestamp: new Date().toISOString()
        }]
      });
      
      console.log('Verification submission result:', result);
      
      if (!result.success) {
        throw new Error(result.debugInfo?.errors?.[0]?.message || 'Verification submission failed');
      }
      
      toast.success('Verification submitted successfully!');
      
      // Move to the status tab
      setActiveTab('status');
      
      // Force a refetch to get the latest data
      setTimeout(() => {
        refetch();
      }, 500);
    } catch (error) {
      console.error('Error submitting verification:', error);
      
      // Update debug info with error
      updateDebugInfo({
        errors: [{
          type: 'verification_submission_error',
          message: (error as Error).message,
          stack: (error as Error).stack,
          timestamp: new Date().toISOString()
        }],
        lastError: {
          message: (error as any).message,
          code: (error as any).code,
          details: (error as any).details,
          hint: (error as any).hint
        }
      });
      
      toast.error(`Failed to submit verification: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleDocumentUpload,
    handleVerificationSubmit
  };
};
