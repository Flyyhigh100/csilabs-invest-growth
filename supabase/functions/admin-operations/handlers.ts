
import { userOperations } from './user-operations.ts';
import { userAuthOperations } from './user-auth-operations.ts';
import { kycOperations } from './kyc-operations.ts';
import { transactionOperations } from './transaction-operations.ts';

export const handlers = {
  // User operations
  getUserDetails: userOperations.getUserDetails,
  getAllUsers: userOperations.getAllUsers,
  getUserAuthDetails: userAuthOperations.getUserAuthDetails,
  
  // KYC operations
  getKycVerifications: kycOperations.getKycVerifications,
  approveKyc: kycOperations.approveKyc,
  rejectKyc: kycOperations.rejectKyc,
  requestKycClarification: kycOperations.requestKycClarification,
  getKycVerification: kycOperations.getKycVerification,
  
  // Transaction operations
  getAllTransactions: transactionOperations.getAllTransactions,
  updateTransactionStatus: transactionOperations.updateTransactionStatus,
  getTransactionDetails: transactionOperations.getTransactionDetails,
  manualSync: transactionOperations.manualSync,
  syncAllTransactions: transactionOperations.syncAllTransactions,
  cleanupPendingTransactions: transactionOperations.cleanupPendingTransactions,
  
  // Test data operations
  markDataAsTest: async (data, adminClient) => {
    const { data: result, error } = await adminClient.rpc('mark_data_as_test');
    if (error) throw error;
    return result;
  }
};
