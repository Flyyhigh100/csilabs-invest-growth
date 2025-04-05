
/**
 * Exports all KYC operations for use in the handlers
 */
import { processKycVerification, requestKycClarification } from "./processors.ts";

export const kycOperations = {
  processKyc: processKycVerification,
  requestKycClarification
};
