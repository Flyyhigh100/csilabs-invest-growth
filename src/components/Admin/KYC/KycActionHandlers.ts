
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { KycVerificationWithProfile } from './types';
import { supabase } from '@/integrations/supabase/client';

export const useKycActionHandlers = (
  onSuccess: () => void
) => {
  const queryClient = useQueryClient();
  
  // Process KYC verification (approve or reject)
  const processMutation = useMutation({
    mutationFn: async ({ 
      kycId, 
      status, 
      rejectionReason 
    }: { 
      kycId: string; 
      status: 'approved' | 'rejected'; 
      rejectionReason?: string;
    }) => {
      console.log('Processing KYC verification:', { kycId, status, rejectionReason });
      
      try {
        // Use the admin-operations edge function to bypass RLS policy issues
        const { data, error } = await supabase.functions.invoke('admin-operations', {
          body: {
            action: 'processKyc',
            data: {
              kycId,
              status,
              rejectionReason
            }
          }
        });
        
        if (error) {
          console.error('Error from admin-operations function:', error);
          throw new Error(error.message || 'Failed to process KYC verification');
        }
        
        console.log('Admin operations response:', data);
        return true;
      } catch (error) {
        console.error('Exception in processKycVerification:', error);
        throw error;
      }
    },
    onSuccess: () => {
      onSuccess();
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      
      // Force a more aggressive refetch of all KYC data
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      }, 1000);
      
      toast.success(`KYC verification processed successfully`);
    },
    onError: (error) => {
      console.error('Error processing KYC verification:', error);
      toast.error('Failed to process KYC verification');
    },
  });
  
  // Request clarification from user
  const clarificationMutation = useMutation({
    mutationFn: async ({ 
      kycId, 
      message 
    }: { 
      kycId: string; 
      message: string;
    }) => {
      console.log('Requesting clarification:', { kycId, message });
      
      try {
        // Use the admin-operations edge function to bypass RLS policy issues
        const { data, error } = await supabase.functions.invoke('admin-operations', {
          body: {
            action: 'requestKycClarification',
            data: {
              kycId,
              message
            }
          }
        });
        
        if (error) {
          console.error('Error from admin-operations function:', error);
          throw new Error(error.message || 'Failed to request clarification');
        }
        
        console.log('Admin operations response:', data);
        return true;
      } catch (error) {
        console.error('Exception in requestKycClarification:', error);
        throw error;
      }
    },
    onSuccess: () => {
      onSuccess();
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      
      // Force a more aggressive refetch of all KYC data
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      }, 1000);
      
      toast.success(`Clarification request sent successfully`);
    },
    onError: (error) => {
      console.error('Error sending clarification request:', error);
      toast.error('Failed to send clarification request');
    },
  });

  // Handler functions
  const handleApprove = (selectedKyc: KycVerificationWithProfile | null) => {
    if (!selectedKyc) return;
    
    console.log('Approving KYC for:', selectedKyc.id);
    processMutation.mutate({
      kycId: selectedKyc.id,
      status: 'approved'
    });
  };
  
  const handleReject = (
    selectedKyc: KycVerificationWithProfile | null, 
    rejectionReason: string
  ) => {
    if (!selectedKyc || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    console.log('Rejecting KYC for:', selectedKyc.id, 'with reason:', rejectionReason);
    processMutation.mutate({
      kycId: selectedKyc.id,
      status: 'rejected',
      rejectionReason: rejectionReason.trim()
    });
  };
  
  const handleRequestClarification = (
    selectedKyc: KycVerificationWithProfile | null,
    clarificationMessage: string
  ) => {
    if (!selectedKyc || !clarificationMessage.trim()) {
      toast.error('Please provide clarification details');
      return;
    }
    
    console.log('Requesting clarification for:', selectedKyc.id, 'with message:', clarificationMessage);
    clarificationMutation.mutate({
      kycId: selectedKyc.id,
      message: clarificationMessage.trim()
    });
  };

  return {
    handleApprove,
    handleReject,
    handleRequestClarification,
    isPending: processMutation.isPending || clarificationMutation.isPending
  };
};
