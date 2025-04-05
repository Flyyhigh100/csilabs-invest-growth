
// Validation functions for KYC operations

/**
 * Validates common KYC operation parameters
 */
export function validateKycParams(kycId: string, status?: string): void {
  // Validate input parameters
  if (!kycId) {
    throw new Error("KYC ID is required");
  }
  
  if (status && !['approved', 'rejected', 'needs_clarification'].includes(status)) {
    throw new Error("Invalid status. Must be one of: approved, rejected, needs_clarification");
  }
}

/**
 * Validates rejection parameters 
 */
export function validateRejectionParams(status: string, rejectionReason?: string): void {
  // Validate rejection reason is provided when status is 'rejected'
  if (status === 'rejected' && !rejectionReason) {
    throw new Error("Rejection reason is required when rejecting a KYC verification");
  }
}

/**
 * Validates clarification parameters
 */
export function validateClarificationParams(message?: string): void {
  if (!message) {
    throw new Error("Clarification message is required");
  }
}
