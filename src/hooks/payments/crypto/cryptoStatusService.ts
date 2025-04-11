import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { CryptoStatusCheckResult } from './types';
import { toast } from 'sonner';

export async function checkCryptoPaymentStatus(
  transactionId: string,
  forceUpdate: boolean = false
): Promise<CryptoStatusCheckResult> {
  console.log(`Checking status for CoinPayments transaction: ${transactionId}, forceUpdate: ${forceUpdate}`);
  
  try {
    // Attempt to invoke the edge function
    const { data, error, status } = await supabase.functions.invoke('check-coinpayments-status', {
      body: {
        transactionId,
        forceUpdate
      }
    });
    
    console.log(`Edge function response:`, {
      data: data || 'none',
      error: error || 'none', 
      status
    });
    
    // Parse error response formats - handle both direct 'error' property and Supabase FunctionsHttpError
    const errorMessage = error?.message || (data && data.error) || null;
    
    // Check for errors
    if (error || status >= 400 || errorMessage) {
      console.error('Error from edge function:', errorMessage || 'Unknown error', 'status:', status);
      
      // Handle 404 errors (transaction not found)
      if (status === 404 || (errorMessage && errorMessage.includes('not found'))) {
        return {
          error: 'Transaction not found in the database. Please refresh the page.',
          status: 'error',
          updated: false,
          transaction_not_found: true
        };
      }
      
      // Handle general API errors
      if (errorMessage) {
        if (errorMessage.includes('API call to CoinPayments failed')) {
          return {
            error: 'CoinPayments API error. Your API keys may be invalid or have insufficient permissions.',
            status: 'error', 
            updated: false,
            api_key_issue: true
          };
        }
        
        if (errorMessage.includes('API credentials') || errorMessage.includes('API key')) {
          return {
            error: 'CoinPayments API credentials issue. Please verify your API keys configuration.',
            status: 'error',
            updated: false,
            api_key_issue: true
          };
        }
      }
      
      // Generic error response
      return {
        error: errorMessage || `Error from edge function (${status || 'unknown status'})`,
        status: 'error',
        updated: false
      };
    }
    
    if (!data) {
      console.error('Empty result from edge function');
      return {
        error: 'No response from status check function',
        status: 'error',
        updated: false
      };
    }
    
    console.log('Status check result:', data);
    
    // Log external status information if available
    if (data.external_status !== undefined) {
      console.log(`External status code: ${data.external_status}, text: ${data.external_status_text}`);
    }
    
    return data;
  } catch (error: any) {
    console.error('Exception in checkCryptoPaymentStatus:', error);
    
    // Check if this is a network or CORS issue
    const errorMessage = error.message || 'Error checking payment status';
    if (errorMessage.includes('NetworkError') || errorMessage.includes('CORS')) {
      return {
        error: 'Network error. Unable to connect to the API endpoint.',
        status: 'error',
        updated: false,
        network_issue: true
      };
    }
    
    return {
      error: errorMessage,
      status: 'error',
      updated: false
    };
  }
}

export function mapTransactionStatus(
  transaction: Transaction, 
  result: CryptoStatusCheckResult
): Transaction {
  // If the transaction was updated or force updated, return with new status
  if (result.updated) {
    if (transaction.status !== result.status) {
      console.log(`Transaction status updated: ${transaction.status} -> ${result.status}`);
      
      // Show toast notification for important status changes
      if (result.status === 'confirmed') {
        toast.success('Payment confirmed!', {
          description: 'Your payment was received and is being processed.'
        });
      } else if (result.status === 'completed') {
        toast.success('Payment completed!', {
          description: 'Your payment has been completed. Your tokens will be sent soon.'
        });
      }
    } else {
      console.log(`Transaction status unchanged (${result.status}) but marked as updated`);
    }
    
    return {
      ...transaction,
      status: result.status
    };
  } 
  
  // Otherwise return the original transaction
  console.log(`No status change needed for transaction ${transaction.id} (${transaction.status})`);
  return transaction;
}
