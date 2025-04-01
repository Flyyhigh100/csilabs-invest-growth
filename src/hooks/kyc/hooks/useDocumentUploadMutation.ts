
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { uploadKycDocument } from '../services/documentService';
import { ensureKycRecordExists } from '../services/personalInfoService';

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
        // Ensure KYC record exists before uploading
        await ensureKycRecordExists(user.id);
        
        console.log(`Uploading ${type} document for user:`, user.id);
        return uploadKycDocument(user.id, file, type);
      } catch (error) {
        console.error(`Error in uploadDocument (${type}):`, error);
        
        // Log additional diagnostic information
        console.log('Diagnostic information:', {
          fileType: file.type,
          fileSize: file.size,
          fileName: file.name
        });
        
        throw error;
      }
    },
    onSuccess: (url, variables) => {
      console.log(`Document uploaded successfully: ${variables.type}`, url);
      toast.success(`${variables.type.replace('_', ' ')} uploaded successfully`);
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['kyc', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-users-kyc'] });
    },
    onError: (error, variables) => {
      console.error(`Error uploading document (${variables.type}):`, error);
      toast.error(`Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return { uploadDocument };
}
