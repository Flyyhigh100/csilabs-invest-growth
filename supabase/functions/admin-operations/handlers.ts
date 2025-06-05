
import { userOperations } from './user-operations.ts';
import { userAuthOperations } from './user-auth-operations.ts';
import { kycOperations } from './kyc-operations.ts';
import { transactionOperations } from './transaction-operations.ts';
import { markTokensSent } from './transactions/token-operations.ts';

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
  
  // Token operations
  markTokensSent: markTokensSent,
  
  // Test data operations
  markDataAsTest: async (data, adminClient) => {
    const { data: result, error } = await adminClient.rpc('mark_data_as_test');
    if (error) throw error;
    return result;
  }
};

// Main handler function that routes operations to appropriate handlers
export const handleAdminOperations = async (operation, data, user, adminClient) => {
  console.log(`🎯 handleAdminOperations called with operation: ${operation}`);
  
  try {
    // Check if the operation exists in our handlers
    if (!handlers[operation]) {
      throw new Error(`Unknown operation: ${operation}`);
    }
    
    // Call the appropriate handler
    const result = await handlers[operation](data, adminClient);
    
    console.log(`✅ Operation ${operation} completed successfully`);
    return result;
    
  } catch (error) {
    console.error(`❌ Error in handleAdminOperations for ${operation}:`, error);
    return {
      error: {
        message: error.message || 'Operation failed',
        operation: operation
      }
    };
  }
};
