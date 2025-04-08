
/**
 * Utility for managing processing locks to prevent multiple calls
 */

// Lock state for KYC processing
let processingLocks = new Map<string, number>();
const LOCK_TIMEOUT = 15000; // 15 seconds

/**
 * Check if a KYC is currently locked for processing
 */
export const isKycLocked = (kycId: string): boolean => {
  if (!kycId) return false; // Safety check for empty IDs
  
  const now = Date.now();
  const lockTimestamp = processingLocks.get(kycId);
  
  if (!lockTimestamp) return false;
  
  // Check if the lock has expired
  if ((now - lockTimestamp) > LOCK_TIMEOUT) {
    processingLocks.delete(kycId);
    console.log(`Lock for KYC ${kycId} has expired and was released`);
    return false;
  }
  
  return true;
};

/**
 * Set a processing lock for a KYC ID
 */
export const setKycLock = (kycId: string): void => {
  if (!kycId) return; // Safety check for empty IDs
  
  console.log(`Setting lock for KYC ${kycId}`);
  processingLocks.set(kycId, Date.now());
};

/**
 * Release the KYC processing lock
 * @param kycId The KYC ID to release the lock for
 * @param delay Optional delay in milliseconds before releasing the lock (default: 2000)
 */
export const releaseKycLock = (kycId: string, delay: number = 2000): void => {
  if (!kycId) return; // Safety check for empty IDs
  
  // Release with delay to prevent immediate retries
  setTimeout(() => {
    console.log(`Releasing lock for KYC ${kycId}`);
    processingLocks.delete(kycId);
  }, delay);
};
