
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { uploadKycDocument, testUpload } from '../services/documentService';
import { ensureKycRecordExists } from '../services/personalInfoService';
import { kycLogger, LogLevel } from '../utils/logger';
import { checkStorageAvailability } from '@/services/storage/initStorage';

/**
 * Hook for uploading KYC documents
 */
export function useDocumentUploadMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Upload document (ID front, ID back, selfie)
  const uploadDocument = useMutation({
    mutationFn: async ({ 
      file, 
      type 
    }: { 
      file: File, 
      type: 'id_front' | 'id_back' | 'selfie' 
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      try {
        // Check if storage is available
        const storageStatus = await checkStorageAvailability();
        if (storageStatus !== 'available') {
          throw new Error('Storage service is currently unavailable. Please try again later.');
        }
        
        // Ensure KYC record exists before uploading
        await ensureKycRecordExists(user.id);
        
        kycLogger.log(LogLevel.INFO, `Uploading ${type} document for user:`, user.id);
        
        // Attempt a test upload first to verify storage functionality
        if (process.env.NODE_ENV === 'development') {
          try {
            await testUpload(new File(['test'], 'test.txt', { type: 'text/plain' }));
          } catch (testError) {
            kycLogger.log(LogLevel.WARN, 'Test upload failed, but will still try actual upload:', testError);
          }
        }
        
        return uploadKycDocument(user.id, file, type);
      } catch (error) {
        kycLogger.log(LogLevel.ERROR, `Upload error for ${type}:`, error);
        
        // Log additional diagnostic information
        kycLogger.log(LogLevel.INFO, 'Diagnostic info:', {
          fileType: file.type,
          fileSize: file.size,
          fileName: file.name
        });
        
        throw error;
      }
    },
    onSuccess: (url, variables) => {
      kycLogger.log(LogLevel.INFO, `Document uploaded: ${variables.type}`, url);
      toast.success(`${variables.type.replace('_', ' ')} uploaded successfully`);
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['kyc', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-users-kyc'] });
    },
    onError: (error, variables) => {
      kycLogger.log(LogLevel.ERROR, `Upload error for ${variables.type}:`, error);
      toast.error(`Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Add a test function to check storage connectivity
  const testStorageConnection = async (): Promise<boolean> => {
    try {
      if (!user) return false;
      
      kycLogger.log(LogLevel.INFO, 'Testing storage connection');
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      await testUpload(testFile);
      return true;
    } catch (error) {
      kycLogger.log(LogLevel.ERROR, 'Storage connectivity test failed:', error);
      return false;
    }
  };

  return { 
    uploadDocument,
    testStorageConnection
  };
}
