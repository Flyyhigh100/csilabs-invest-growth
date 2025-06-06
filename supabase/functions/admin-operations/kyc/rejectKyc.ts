
/**
 * Reject KYC verification
 */
export async function rejectKyc(kycId: string, rejectionReason: string, adminClient: any) {
  console.log(`❌ Rejecting KYC verification: ${kycId}`);
  
  if (!kycId) {
    throw new Error('KYC ID is required');
  }
  
  if (!rejectionReason || !rejectionReason.trim()) {
    throw new Error('Rejection reason is required');
  }
  
  try {
    const updateData = {
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      rejection_reason: rejectionReason.trim(),
      clarification_message: null
    };
    
    const { data, error } = await adminClient
      .from('kyc_verifications')
      .update(updateData)
      .eq('id', kycId)
      .select()
      .single();
    
    if (error) {
      console.error('Error rejecting KYC verification:', error);
      throw new Error(`Failed to reject KYC verification: ${error.message}`);
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
          title: 'KYC Rejected',
          message: `Your KYC verification has been rejected. Reason: ${rejectionReason}`,
          read: false
        });
    } catch (notificationError) {
      console.warn('Failed to create notification:', notificationError);
    }
    
    console.log(`✅ Successfully rejected KYC verification: ${kycId}`);
    return {
      success: true,
      kyc: data,
      message: 'KYC verification rejected successfully'
    };
    
  } catch (error) {
    console.error(`❌ Error rejecting KYC ${kycId}:`, error);
    throw error;
  }
}
