
import { kycOperations } from "./kyc-operations.ts";
import { transactionOperations } from "./transaction-operations.ts";
import { userOperations } from "./user-operations.ts";

export async function handleAdminOperations(action, data, user, adminClient) {
  console.log(`Processing admin operation: ${action}`, data);
  
  try {
    // Process different admin actions
    switch (action) {
      case "getUserDetails":
        return await userOperations.getUserDetails(data, adminClient);

      case "processKyc":
        console.log("🔍 Processing KYC operation with data:", data);
        
        // Add extra validation for KYC operations
        if (!data || !data.kycId) {
          console.error("Missing kycId in KYC operation data");
          throw new Error("KYC ID is required");
        }
        
        if (!data.status || !['approved', 'rejected', 'needs_clarification'].includes(data.status)) {
          console.error("Invalid status in KYC operation:", data.status);
          throw new Error("Invalid status. Must be one of: approved, rejected, needs_clarification");
        }
        
        // Proceed with KYC processing
        console.log(`🚀 Executing KYC operation for ID ${data.kycId} with status ${data.status}`);
        const kycResult = await kycOperations.processKyc(data, user, adminClient);
        console.log("✅ KYC operation completed successfully:", kycResult);
        return kycResult;

      case "requestKycClarification":
        console.log("🔍 Processing KYC clarification request with data:", data);
        
        // Add extra validation for clarification requests
        if (!data || !data.kycId) {
          console.error("Missing kycId in clarification request data");
          throw new Error("KYC ID is required");
        }
        
        if (!data.message) {
          console.error("Missing message in clarification request");
          throw new Error("Clarification message is required");
        }
        
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
        action: action,
        timestamp: new Date().toISOString()
      }
    };
  }
}
