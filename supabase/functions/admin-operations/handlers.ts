
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
        console.log("Processing KYC operation with data:", data);
        const kycResult = await kycOperations.processKyc(data, user, adminClient);
        console.log("KYC operation result:", kycResult);
        return kycResult;

      case "requestKycClarification":
        return await kycOperations.requestKycClarification(data, user, adminClient);

      case "markTokensSent":
        return await transactionOperations.markTokensSent(data, adminClient);

      default:
        console.error("Unknown admin operation:", action);
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error(`Error in admin operation '${action}':`, error);
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
