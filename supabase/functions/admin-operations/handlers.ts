
import { kycOperations } from "./kyc-operations.ts";
import { transactionOperations } from "./transaction-operations.ts";
import { userOperations } from "./user-operations.ts";

export async function handleAdminOperations(action, data, user, adminClient) {
  // Process different admin actions
  switch (action) {
    case "getUserDetails":
      return await userOperations.getUserDetails(data, adminClient);

    case "processKyc":
      return await kycOperations.processKyc(data, user, adminClient);

    case "requestKycClarification":
      return await kycOperations.requestKycClarification(data, adminClient);

    case "markTokensSent":
      return await transactionOperations.markTokensSent(data, adminClient);

    default:
      throw new Error("Unknown action");
  }
}
