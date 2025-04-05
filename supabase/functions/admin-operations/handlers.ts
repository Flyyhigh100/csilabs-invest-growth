
import { kycOperations } from "./kyc/index.ts";
import { transactionOperations } from "./transaction-operations.ts";
import { userOperations } from "./user-operations.ts";
import { validateKycParams } from "./kyc/validators.ts";
import { verifyKycExists } from "./kyc/verification-check.ts";

export async function handleAdminOperations(action, data, user, adminClient) {
  console.log(`Processing admin operation: ${action}`, data);
  
  try {
    // First verify basic parameters
    if (!action) {
      throw new Error("Action parameter is required");
    }
    
    if (!user || !user.id) {
      throw new Error("User authentication required");
    }
    
    if (!adminClient) {
      throw new Error("Admin client is required");
    }
    
    console.log(`User ${user.id} (${user.email}) attempting admin operation: ${action}`);
    
    // Process different admin actions
    switch (action) {
      case "getUserDetails":
        return await userOperations.getUserDetails(data, adminClient);
      
      case "getAllUsers":
        return await userOperations.getAllUsers(data, adminClient);

      case "processKyc":
        console.log("🔍 Processing KYC operation with data:", data);
        
        // Add extra validation for KYC operations
        validateKycParams(data?.kycId, data?.status);
        
        // Check if the specified KYC record exists first
        await verifyKycExists(adminClient, data.kycId);
        
        // Proceed with KYC processing
        console.log(`🚀 Executing KYC operation for ID ${data.kycId} with status ${data.status}`);
        const kycResult = await kycOperations.processKyc(data, user, adminClient);
        console.log("✅ KYC operation completed successfully:", kycResult);
        return kycResult;

      case "requestKycClarification":
        console.log("🔍 Processing KYC clarification request with data:", data);
        
        // Add extra validation for clarification requests
        validateKycParams(data?.kycId);
        
        if (!data || !data.message) {
          console.error("Missing message in clarification request");
          throw new Error("Clarification message is required");
        }
        
        // Check if the specified KYC record exists first
        await verifyKycExists(adminClient, data.kycId);
        
        // Proceed with clarification request
        console.log(`🚀 Executing KYC clarification request for ID ${data.kycId}`);
        const clarificationResult = await kycOperations.requestKycClarification(data, user, adminClient);
        console.log("✅ KYC clarification request completed successfully:", clarificationResult);
        return clarificationResult;

      case "markTokensSent":
        return await transactionOperations.markTokensSent(data, adminClient);

      default:
        console.error("Unknown admin operation:", action);
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error(`❌ Error in admin operation '${action}':`, error);
    // Return a structured error response
    return {
      error: {
        message: error.message,
        details: error.details || {},
        code: error.code || 'UNKNOWN_ERROR',
        action: action,
        data: error.data || null,
        timestamp: new Date().toISOString()
      }
    };
  }
}
