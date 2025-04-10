
// This file is for backward compatibility
// It re-exports all admin utilities from the new structure
export { 
  isUserAdmin, 
  addSelfAsAdmin,
  processKycVerification, 
  requestKycClarification, 
  markTokensAsSent,
  getKycDocumentUrl,
  verifyImageUrl,
  checkBucketExists
} from './admin';
