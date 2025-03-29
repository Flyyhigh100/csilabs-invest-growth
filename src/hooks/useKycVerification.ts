
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type KycStatus = Database['public']['Enums']['kyc_status'];

export interface KycVerificationData {
  id: string;
  user_id: string;
  status: KycStatus;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  id_front_url: string | null;
  id_back_url: string | null;
  selfie_url: string | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KycFormData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
}

export function useKycVerification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch KYC verification data
  const {
    data: kycData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['kyc', user?.id],
    queryFn: async (): Promise<KycVerificationData | null> => {
      if (!user) return null;
      
      // Check if there's an existing verification record
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching KYC data:', error);
        throw error;
      }
      
      // If no record exists, create one with not_started status
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('kyc_verifications')
          .insert({ user_id: user.id, status: 'not_started' })
          .select('*')
          .single();
        
        if (insertError) {
          console.error('Error creating KYC record:', insertError);
          throw insertError;
        }
        
        return newData;
      }
      
      return data;
    },
    enabled: !!user,
  });
  
  // Save KYC personal information
  const savePersonalInfo = useMutation({
    mutationFn: async (formData: KycFormData) => {
      if (!user || !kycData) throw new Error('User not authenticated or KYC data not found');
      
      const { error } = await supabase
        .from('kyc_verifications')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      refetch();
      toast.success('Personal information saved successfully');
    },
    onError: (error) => {
      console.error('Error saving personal information:', error);
      toast.error('Failed to save personal information');
    }
  });
  
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
      
      // Upload file to storage
      const filePath = `${user.id}/${type}_${Date.now()}.${file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('kyc_documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('kyc_documents')
        .getPublicUrl(filePath);
      
      // Update KYC record with file URL
      const updateData: Record<string, string> = {};
      updateData[`${type}_url`] = urlData.publicUrl;
      
      const { error: updateError } = await supabase
        .from('kyc_verifications')
        .update(updateData)
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
      return urlData.publicUrl;
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    }
  });
  
  // Submit KYC verification
  const submitVerification = useMutation({
    mutationFn: async () => {
      if (!user || !kycData) throw new Error('User not authenticated or KYC data not found');
      
      const currentTimestamp = new Date().toISOString();
      
      // Clear any previous rejection reason if resubmitting
      const updateData = {
        status: 'pending' as KycStatus,
        submitted_at: currentTimestamp,
        updated_at: currentTimestamp,
        rejection_reason: null
      };
      
      const { error } = await supabase
        .from('kyc_verifications')
        .update(updateData)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error submitting KYC verification:', error);
        throw error;
      }
      
      // Invalidate any cached KYC data to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['kyc', user.id] });
      
      // Also invalidate admin KYC list if the user happens to be an admin
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      
      return true;
    },
    onSuccess: () => {
      toast.success('Your verification has been submitted successfully! We will review it shortly.');
    },
    onError: (error) => {
      console.error('Error submitting verification:', error);
      toast.error('Failed to submit verification');
    }
  });
  
  return {
    kycData,
    isLoading,
    error,
    savePersonalInfo,
    uploadDocument,
    submitVerification,
    refetch
  };
}
