
// Re-export all document-related functionality
export { 
  uploadKycDocument,
  uploadToSpecificBucket
} from './documentUploader';

export {
  getAvailableBuckets,
  testUpload
} from './documentStorage';

export {
  updateKycRecordWithDocumentUrl
} from './documentRecords';
