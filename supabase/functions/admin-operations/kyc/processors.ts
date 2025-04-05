
/**
 * Core processing functions for KYC operations
 */
import { verifyAdminPermissions, verifyDatabaseAccess } from "./admin-auth.ts";
import { validateKycParams, validateRejectionParams, validateClarificationParams } from "./validators.ts";
import { verifyKycExists } from "./verification-check.ts";

/**
 * Processes a KYC verification update (approve, reject, clarification)
 */
export async function processKycVerification(data: any, user: any, adminClient: any) {
  const { kycId, status, rejectionReason } = data;
  
  console.log(`Admin ${user.id} processing KYC ${kycId} with status ${status}`);
  
  // Validate input parameters
  validateKycParams(kycId, status);
  validateRejectionParams(status, rejectionReason);
  
  // Verify admin permissions with detailed error handling
  await verifyAdminPermissions(user, adminClient);
  
  // Try to verify database access before performing update
  await verifyDatabaseAccess(adminClient);
  
  // First, fetch the current KYC record to verify it exists
  await verifyKycExists(adminClient, kycId);
  
  // Define update data with appropriate type casting for timestamp fields
  const updateData = buildUpdateData(status, rejectionReason, user.id);
  
  // Log the operation and data for debugging
  console.log("Admin processing KYC verification with update data:", updateData);
  
  try {
    // Use the admin client to bypass RLS
    const { data: kycData, error: kycError } = await adminClient
      .from("kyc_verifications")
      .update(updateData)
      .eq("id", kycId)
      .select()
      .single();
    
    if (kycError) {
      console.error("KYC update error:", kycError);
      console.log("Error details:", JSON.stringify(kycError, Object.getOwnPropertyNames(kycError)));
      throw new Error(`Failed to update KYC: ${kycError.message}`);
    }
    
    if (!kycData) {
      throw new Error("KYC update returned no data");
    }
    
    console.log("KYC update successful, returned data:", kycData);
    
    // Add extra verification steps to ensure update was successful
    await verifyUpdate(adminClient, kycId, status);
    
    return { kyc: kycData, success: true };
  } catch (error) {
    console.error("Error in KYC update operation:", error);
    console.log("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw error;
  }
}

/**
 * Processes a clarification request
 */
export async function requestKycClarification(data: any, user: any, adminClient: any) {
  const { kycId, message } = data;
  
  // Validate input parameters
  validateKycParams(kycId);
  validateClarificationParams(message);
  
  console.log(`Admin ${user.id} requesting clarification for KYC ${kycId}`);
  
  // Double-check admin permissions explicitly
  await verifyAdminPermissions(user, adminClient);
  
  try {
    // Log current state before update
    await verifyKycExists(adminClient, kycId);
    
    // Use the admin client to bypass RLS
    const { data: clarifyData, error: clarifyError } = await adminClient
      .from("kyc_verifications")
      .update({
        status: "needs_clarification",
        clarification_message: message,
        reviewed_at: new Date().toISOString(),
        approved_at: null,
        approved_by: null,
        rejection_reason: null
      })
      .eq("id", kycId)
      .select()
      .single();
    
    if (clarifyError) {
      console.error("KYC clarification update error:", clarifyError);
      console.log("Error details:", JSON.stringify(clarifyError, Object.getOwnPropertyNames(clarifyError)));
      throw clarifyError;
    }
    
    if (!clarifyData) {
      throw new Error("KYC clarification update returned no data");
    }
    
    console.log("KYC clarification update successful:", clarifyData);
    
    // Verify the update went through correctly
    await verifyUpdate(adminClient, kycId, "needs_clarification");
    
    return { kyc: clarifyData, success: true };
  } catch (error) {
    console.error("Error in KYC clarification operation:", error);
    console.log("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw error;
  }
}

/**
 * Helper function to build update data object based on status
 */
function buildUpdateData(status: string, rejectionReason: string | null | undefined, userId: string) {
  const updateData: any = {
    status,
    reviewed_at: new Date().toISOString(),
  };
  
  if (status === "approved") {
    updateData.approved_at = new Date().toISOString();
    updateData.approved_by = userId;
    updateData.rejection_reason = null;
    updateData.clarification_message = null;
  } else if (status === "rejected" && rejectionReason) {
    updateData.rejection_reason = rejectionReason;
    updateData.approved_at = null;
    updateData.approved_by = null;
    updateData.clarification_message = null;
  } else if (status === "needs_clarification") {
    updateData.clarification_message = rejectionReason;
    updateData.approved_at = null;
    updateData.approved_by = null;
    updateData.rejection_reason = null;
  }
  
  return updateData;
}

/**
 * Verifies that an update was successful
 */
async function verifyUpdate(adminClient: any, kycId: string, expectedStatus: string) {
  const { data: verifyData, error: verifyError } = await adminClient
    .from("kyc_verifications")
    .select("*")
    .eq("id", kycId)
    .single();
    
  if (verifyError) {
    console.error("Error verifying KYC update:", verifyError);
    console.warn("Update may have completed successfully but verification failed");
    return;
  }
  
  if (verifyData) {
    console.log(`Verified KYC status after update: ${verifyData.status}`);
    
    // Add additional verification to check if the status actually changed
    if (verifyData.status !== expectedStatus) {
      console.error(`Status mismatch! Expected ${expectedStatus} but found ${verifyData.status}`);
      throw new Error(`Status mismatch: Expected ${expectedStatus} but found ${verifyData.status}`);
    } else {
      console.log("Status update verified successfully");
    }
  }
}
