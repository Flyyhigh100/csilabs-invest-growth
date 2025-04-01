
/**
 * Centralized logging utility for KYC-related operations
 * Helps with debugging while keeping the core business logic clean
 */

// Log levels
export enum LogLevel {
  INFO = 'info',
  ERROR = 'error',
  WARN = 'warn',
  DEBUG = 'debug'
}

// KYC-specific logger
export const kycLogger = {
  // User data operations
  fetchingData: (userId: string) => {
    console.log('Fetching KYC data for user:', userId);
  },
  dataFetchError: (error: any) => {
    console.error('Error in KYC data fetch:', error);
  },
  dataSaved: (result: any) => {
    console.log('KYC personal info saved:', result);
  },
  
  // Storage operations
  runningStorageDiagnostics: () => {
    console.log('Running storage diagnostics...');
  },
  availableBuckets: (buckets: any) => {
    console.log('Available buckets:', buckets);
  },
  storageDiagnosticsError: (error: any) => {
    console.error('Error in storage diagnostics:', error);
  },
  
  // Document uploads
  uploadingDocument: (userId: string, type: string) => {
    console.log(`Uploading ${type} document for user:`, userId);
  },
  documentUploaded: (type: string, url: string) => {
    console.log(`Document uploaded successfully: ${type}`, url);
  },
  uploadError: (type: string, error: any) => {
    console.error(`Error uploading document (${type}):`, error);
  },
  
  // Personal info operations
  savingPersonalInfo: (userId: string) => {
    console.log('Saving personal info for user:', userId);
  },
  personalInfoError: (error: any) => {
    console.error('Error in savePersonalInfo:', error);
  },
  
  // Verification submission
  submittingVerification: (userId: string) => {
    console.log('Submitting verification for user:', userId);
  },
  verificationSubmitted: () => {
    console.log("KYC verification submitted successfully");
  },
  submissionError: (error: any) => {
    console.error('Error submitting verification:', error);
  },
  
  // Generic logging
  log: (level: LogLevel, message: string, data?: any) => {
    switch (level) {
      case LogLevel.INFO:
        console.log(message, data);
        break;
      case LogLevel.ERROR:
        console.error(message, data);
        break;
      case LogLevel.WARN:
        console.warn(message, data);
        break;
      case LogLevel.DEBUG:
        console.debug(message, data);
        break;
    }
  },
  
  // Validation logs
  missingDocuments: () => {
    console.error('Missing required document uploads');
  },
  
  // Additional diagnostic information
  diagnosticInfo: (info: any) => {
    console.log('Diagnostic information:', info);
  }
};

