
// This file now serves as a re-export layer for backward compatibility

import { 
  fetchKycVerifications, 
  testDirectKycAccess, 
  verifyAdminAccess 
} from './services/kycVerificationsFetcher';

import { 
  checkUserKycRecord, 
  listAllUsersWithKycStatus 
} from './services/kycUserService';

import { 
  createTestKycRecord 
} from './services/kycTestingService';

export {
  fetchKycVerifications,
  testDirectKycAccess,
  verifyAdminAccess,
  checkUserKycRecord,
  listAllUsersWithKycStatus,
  createTestKycRecord
};
