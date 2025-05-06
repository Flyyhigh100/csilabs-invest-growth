
// Store for KYC verification locks
const kycLocks: Record<string, boolean> = {};
const kycLockTimeouts: Record<string, NodeJS.Timeout> = {};

/**
 * Check if a KYC verification is locked
 */
export const isKycLocked = (kycId: string): boolean => {
  return !!kycLocks[kycId];
};

/**
 * Set a lock on a KYC verification
 */
export const setKycLock = (kycId: string, autoReleaseMs = 30000): void => {
  kycLocks[kycId] = true;
  
  // Auto-release the lock after the specified time
  if (kycLockTimeouts[kycId]) {
    clearTimeout(kycLockTimeouts[kycId]);
  }
  
  kycLockTimeouts[kycId] = setTimeout(() => {
    releaseKycLock(kycId);
  }, autoReleaseMs);
};

/**
 * Release a lock on a KYC verification
 */
export const releaseKycLock = (kycId: string, delayMs = 0): void => {
  if (delayMs > 0) {
    setTimeout(() => {
      delete kycLocks[kycId];
      
      if (kycLockTimeouts[kycId]) {
        clearTimeout(kycLockTimeouts[kycId]);
        delete kycLockTimeouts[kycId];
      }
    }, delayMs);
  } else {
    delete kycLocks[kycId];
    
    if (kycLockTimeouts[kycId]) {
      clearTimeout(kycLockTimeouts[kycId]);
      delete kycLockTimeouts[kycId];
    }
  }
};
