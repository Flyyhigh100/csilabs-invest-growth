
/**
 * Approve KYC verification
 */
export async function approveKyc(kycId: string, adminClient: any) {
  console.log(`✅ Approving KYC verification: ${kycId}`);
  
  if (!kycId) {
    throw new Error('KYC ID is required');
  }
  
  try {
    const updateData = {
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      rejection_reason: null,
      clarification_message: null
    };
    
    const { data, error } = await adminClient
      .from('kyc_verifications')
      .update(updateData)
      .eq('id', kycId)
      .select()
      .single();
    
    if (error) {
      console.error('Error approving KYC verification:', error);
      throw new Error(`Failed to approve KYC verification: ${error.message}`);
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
          title: 'KYC Approved',
          message: 'Your KYC verification has been approved by admin.',
          read: false
        });
    } catch (notificationError) {
      console.warn('Failed to create notification:', notificationError);
    }
    
    // Send email notification (non-blocking)
    try {
      console.log(`📧 Sending approval email notification for KYC ${kycId} to user ${data.user_id}`);
      
      const emailResult = await adminClient.functions.invoke('send-kyc-notification-email', {
        body: {
          userId: data.user_id,
          kycId: kycId,
          status: 'approved'
        }
      });
      
      if (emailResult.error) {
        console.warn('Failed to send approval email notification:', emailResult.error);
      } else {
        console.log('✅ Approval email notification sent successfully:', emailResult.data);
      }
    } catch (emailError) {
      // Email failure should not break the KYC approval process
      console.warn('Failed to send approval email notification (non-critical):', emailError);
    }
    
    console.log(`✅ Successfully approved KYC verification: ${kycId}`);
    return {
      success: true,
      kyc: data,
      message: 'KYC verification approved successfully'
    };
    
  } catch (error) {
    console.error(`❌ Error approving KYC ${kycId}:`, error);
    throw error;
  }
}
