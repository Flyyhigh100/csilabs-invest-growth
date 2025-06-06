
/**
 * Request clarification for KYC verification
 */
export async function requestKycClarification(kycId: string, message: string, adminClient: any) {
  console.log(`❓ Requesting clarification for KYC verification: ${kycId}`);
  
  if (!kycId) {
    throw new Error('KYC ID is required');
  }
  
  if (!message || !message.trim()) {
    throw new Error('Clarification message is required');
  }
  
  try {
    const updateData = {
      status: 'needs_clarification',
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      clarification_message: message.trim(),
      rejection_reason: null
    };
    
    const { data, error } = await adminClient
      .from('kyc_verifications')
      .update(updateData)
      .eq('id', kycId)
      .select()
      .single();
    
    if (error) {
      console.error('Error requesting KYC clarification:', error);
      throw new Error(`Failed to request KYC clarification: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('KYC verification not found or update failed');
    }
    
    // Create notification for user
    try {
      await adminClient
        .from('notifications')
        .insert({
          user_id: data.user_id,
          type: 'kyc',
          title: 'KYC Clarification Needed',
          message: `Admin has requested clarification for your KYC verification: ${message}`,
          read: false
        });
    } catch (notificationError) {
      console.warn('Failed to create notification:', notificationError);
    }
    
    console.log(`✅ Successfully requested clarification for KYC verification: ${kycId}`);
    return {
      success: true,
      kyc: data,
      message: 'KYC clarification requested successfully'
    };
    
  } catch (error) {
    console.error(`❌ Error requesting clarification for KYC ${kycId}:`, error);
    throw error;
  }
}
