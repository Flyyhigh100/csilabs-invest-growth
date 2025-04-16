
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { checkCryptoPaymentStatus } from './statusCheckService';
import { showStatusMessage } from './notificationService';

// Re-export from notificationService to maintain backward compatibility
export { showStatusMessage, handleTransactionUpdate } from './notificationService';

// Get all pending crypto transactions
export { getPendingTransactions } from './transactionRepository';

// Process a transaction update and show appropriate messages
export { mapTransactionStatus } from './notificationService';
