
import { getKycVerification as getKycVerificationFn } from './kyc/getKycVerification.ts';
import { getKycVerifications as getKycVerificationsFn } from './kyc/getKycVerifications.ts';
import { approveKyc as approveKycFn } from './kyc/approveKyc.ts';
import { rejectKyc as rejectKycFn } from './kyc/rejectKyc.ts';
import { requestKycClarification as requestKycClarificationFn } from './kyc/requestKycClarification.ts';

/**
 * Get KYC verifications
 */
const getKycVerifications = async (data, adminClient) => {
  try {
    return await getKycVerificationsFn(adminClient);
  } catch (error) {
    console.error('Error in getKycVerifications:', error);
    throw error;
  }
};

/**
 * Get KYC verification by ID
 */
const getKycVerification = async (data, adminClient) => {
  try {
    const { kycId } = data;
    if (!kycId) {
      throw new Error('KYC ID is required');
    }
    return await getKycVerificationFn(kycId, adminClient);
  } catch (error) {
    console.error('Error in getKycVerification:', error);
    throw error;
  }
};

/**
 * Approve KYC verification
 */
const approveKyc = async (data, adminClient) => {
  try {
    const { kycId } = data;
    if (!kycId) {
      throw new Error('KYC ID is required');
    }
    return await approveKycFn(kycId, adminClient);
  } catch (error) {
    console.error('Error in approveKyc:', error);
    throw error;
  }
};

/**
 * Reject KYC verification
 */
const rejectKyc = async (data, adminClient) => {
  try {
    const { kycId, rejectionReason } = data;
    if (!kycId) {
      throw new Error('KYC ID is required');
    }
    if (!rejectionReason) {
      throw new Error('Rejection reason is required');
    }
    return await rejectKycFn(kycId, rejectionReason, adminClient);
  } catch (error) {
    console.error('Error in rejectKyc:', error);
    throw error;
  }
};

/**
 * Request KYC clarification
 */
const requestKycClarification = async (data, adminClient) => {
  try {
    const { kycId, message } = data;
    if (!kycId) {
      throw new Error('KYC ID is required');
    }
    if (!message) {
      throw new Error('Clarification message is required');
    }
    return await requestKycClarificationFn(kycId, message, adminClient);
  } catch (error) {
    console.error('Error in requestKycClarification:', error);
    throw error;
  }
};

/**
 * Process KYC verification - approve, reject, or request clarification
 * This is the unified handler that the frontend calls via processKyc operation
 */
export const processKyc = async (data, adminClient) => {
  const { kycId, status, rejectionReason } = data;
  
  console.log(`🔍 Processing KYC ${kycId} with status: ${status}`);
  
  if (!kycId || !status) {
    throw new Error('Missing required fields: kycId and status are required');
  }
  
  try {
    // Validate status
    const validStatuses = ['approved', 'rejected', 'needs_clarification'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    // For rejected status, rejection reason is required
    if (status === 'rejected' && (!rejectionReason || !rejectionReason.trim())) {
      throw new Error('Rejection reason is required when rejecting KYC verification');
    }
    
    // For clarification status, message is required (passed as rejectionReason)
    if (status === 'needs_clarification' && (!rejectionReason || !rejectionReason.trim())) {
      throw new Error('Clarification message is required when requesting clarification');
    }
    
    // Prepare update data
    const updateData = {
      status,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add rejection reason or clarification message if provided
    if (status === 'rejected' && rejectionReason) {
      updateData.rejection_reason = rejectionReason.trim();
    } else if (status === 'needs_clarification' && rejectionReason) {
      updateData.clarification_message = rejectionReason.trim();
    } else if (status === 'approved') {
      updateData.approved_at = new Date().toISOString();
      // Clear any previous rejection reason or clarification message
      updateData.rejection_reason = null;
      updateData.clarification_message = null;
    }
    
    // Update the KYC verification
    const { data: kycData, error: updateError } = await adminClient
      .from('kyc_verifications')
      .update(updateData)
      .eq('id', kycId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating KYC verification:', updateError);
      throw new Error(`Failed to update KYC verification: ${updateError.message}`);
    }
    
    if (!kycData) {
      throw new Error('KYC verification not found or update failed');
    }
    
    console.log(`✅ KYC ${kycId} successfully updated to status: ${status}`);
    
    // Create audit log entry for admin action
    try {
      await adminClient
        .from('notifications')
        .insert({
          user_id: kycData.user_id,
          type: 'admin_audit',
          title: `KYC ${status}`,
          message: `KYC verification ${status} by admin. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
          read: false
        });
    } catch (auditError) {
      console.warn('Failed to create audit log:', auditError);
      // Don't fail the main operation if audit logging fails
    }
    
    return {
      success: true,
      kyc: kycData,
      message: `KYC verification ${status} successfully`
    };
    
  } catch (error) {
    console.error(`❌ Error processing KYC ${kycId}:`, error);
    throw error;
  }
};

/**
 * Resend KYC notification email
 */
const resendKycNotification = async (data, adminClient, user) => {
  try {
    const { kycId } = data;
    
    console.log(`🔄 Attempting to resend KYC notification for KYC ID: ${kycId}`);
    
    if (!kycId) {
      throw new Error('KYC ID is required');
    }
    
    // Get the admin ID from the authenticated user object passed from the handler
    const adminId = user?.id;
    if (!adminId) {
      throw new Error('Admin user ID is required for this operation');
    }
    
    console.log(`👤 Using admin ID: ${adminId} for KYC notification resend`);
    
    // Call the manual notification edge function
    const result = await adminClient.functions.invoke('send-kyc-manual-notification', {
      body: {
        kycId,
        adminId
      }
    });
    
    if (result.error) {
      console.error(`❌ Error resending KYC notification: ${result.error.message}`);
      throw new Error(`Failed to resend notification: ${result.error.message}`);
    }
    
    console.log(`✅ Successfully resent KYC notification email for KYC ${kycId}`);
    
    return {
      success: true,
      message: 'KYC notification email resent successfully',
      data: result.data
    };
    
  } catch (error) {
    console.error('Error in resendKycNotification:', error);
    throw error;
  }
};

export const kycOperations = {
  getKycVerifications,
  approveKyc,
  rejectKyc,
  requestKycClarification,
  getKycVerification,
  processKyc, // Add the new unified handler
  resendKycNotification // Add the new resend notification handler
};
