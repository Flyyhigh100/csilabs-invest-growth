
// Re-export all functions from the new service files
// This maintains backward compatibility with existing imports

import {
  fetchKycVerification,
  saveKycPersonalInfo,
  ensureKycRecordExists
} from './services/personalInfoService';

import {
  uploadKycDocument
} from './services/documentService';

import {
  submitKycVerification
} from './services/verificationService';

import {
  insertTestKycVerification,
  createTestKycRecord
} from './services/testHelpers';

export {
  fetchKycVerification,
  saveKycPersonalInfo,
  uploadKycDocument,
  submitKycVerification,
  ensureKycRecordExists,
  insertTestKycVerification,
  createTestKycRecord
};
