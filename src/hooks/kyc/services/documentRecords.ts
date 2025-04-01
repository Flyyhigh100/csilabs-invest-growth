
import { supabase } from '@/integrations/supabase/client';
import { kycLogger, LogLevel } from '@/hooks/kyc/utils/logger';

// Update KYC record with document URL
export const updateKycRecordWithDocumentUrl = async (
  userId: string,
  type: 'id_front' | 'id_back' | 'selfie',
  url: string
): Promise<void> => {
  try {
    // Ensure KYC record exists
    const { data: existingKyc, error: kycCheckError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (kycCheckError) {
      kycLogger.log(LogLevel.ERROR, 'Error checking for KYC record:', kycCheckError);
      throw kycCheckError;
    }
    
    // Create KYC record if it doesn't exist
    if (!existingKyc) {
      kycLogger.log(LogLevel.INFO, 'No KYC record exists, creating a new one');
      
      const updateData: any = {
        user_id: userId,
        status: 'not_started' as string
      };
      
      // Set the appropriate URL field
      if (type === 'id_front') {
        updateData.id_front_url = url;
      } else if (type === 'id_back') {
        updateData.id_back_url = url;
      } else if (type === 'selfie') {
        updateData.selfie_url = url;
      }
      
      const { error: insertError } = await supabase
        .from('kyc_verifications')
        .insert(updateData);
      
      if (insertError) {
        kycLogger.log(LogLevel.ERROR, 'Error creating KYC record with document URL:', insertError);
        throw insertError;
      }
      
      kycLogger.log(LogLevel.INFO, 'Created new KYC record with document URL');
    } else {
      // Update the appropriate URL field based on the document type
      const updateData: any = {};
      
      if (type === 'id_front') {
        updateData.id_front_url = url;
      } else if (type === 'id_back') {
        updateData.id_back_url = url;
      } else if (type === 'selfie') {
        updateData.selfie_url = url;
      }
      
      const { error: updateError } = await supabase
        .from('kyc_verifications')
        .update(updateData)
        .eq('user_id', userId);
      
      if (updateError) {
        kycLogger.log(LogLevel.ERROR, `Error updating ${type} URL:`, updateError);
        throw updateError;
      }
      
      kycLogger.log(LogLevel.INFO, `Updated ${type} URL in KYC record`);
    }
  } catch (error) {
    kycLogger.log(LogLevel.ERROR, 'Error updating KYC record with document URL:', error);
    throw error;
  }
};
