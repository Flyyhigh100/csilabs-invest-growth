
// This file now serves as a re-export layer for backward compatibility
// All implementations have been moved to the verification directory

import { 
  submitKycVerification,
  checkVerificationStatus,
  getVerificationDetails
} from './verification';

export {
  submitKycVerification,
  checkVerificationStatus,
  getVerificationDetails
};
