
/**
 * Utility for managing processing locks to prevent multiple calls
 */

// Lock state for KYC processing
let processingLock = false;
let lastProcessedKycId = '';
let lastProcessedTimestamp = 0;
const LOCK_TIMEOUT = 10000; // 10 seconds

/**
 * Check if a KYC is currently locked for processing
 */
export const isKycLocked = (kycId: string): boolean => {
  const now = Date.now();
  return processingLock && 
         kycId === lastProcessedKycId && 
         (now - lastProcessedTimestamp) < LOCK_TIMEOUT;
};

/**
 * Set a processing lock for a KYC ID
 */
export const setKycLock = (kycId: string): void => {
  processingLock = true;
  lastProcessedKycId = kycId;
  lastProcessedTimestamp = Date.now();
};

/**
 * Release the KYC processing lock
 */
export const releaseKycLock = (delay = 2000): void => {
  // Release with delay to prevent immediate retries
  setTimeout(() => {
    processingLock = false;
  }, delay);
};
