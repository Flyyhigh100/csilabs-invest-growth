
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
    const { data: result, error } = await supabase.functions.invoke('check-coinpayments-status', {
      body: {
        transactionId,
        forceUpdate
      }
    }) as { data: CryptoStatusCheckResult, error: any };
    
    if (error) {
      console.error('Error from edge function:', error);
      
      let errorMessage = error.message || 'Edge function error. Please try again later';
      
      // Parse the error to check if it's a CoinPayments API issue
      if (typeof error.message === 'string' && error.message.includes('API call to CoinPayments failed')) {
        errorMessage = 'CoinPayments API error. Your API keys may be invalid or have insufficient permissions.';
      }
      
      // Check if this is a 404 error (function not found or not deployed)
      else if (error.message && error.message.includes('404')) {
        errorMessage = 'The check-coinpayments-status function is not deployed or not accessible.';
      }
      
      return {
        error: errorMessage,
        status: 'error',
        updated: false
      };
    }
    
    if (!result) {
      console.error('Empty result from edge function');
      return {
        error: 'No response from status check function',
        status: 'error',
        updated: false
      };
    }
    
    if (result.error) {
      console.error('Error in status check result:', result.error);
      
      // Check if transaction not found
      if (result.error === 'Transaction not found') {
        return {
          error: 'Transaction not found in the database. Please refresh the page.',
          status: 'error',
          updated: false,
          transaction_not_found: true
        };
      }
      
      // Check if this is an API key issue
      if (result.error.includes('API') && 
          (result.error.includes('key') || result.error.includes('credential'))) {
        return {
          error: 'CoinPayments API key error. Please verify your API keys are correctly configured.',
          status: 'error',
          updated: false,
          api_key_issue: true
        };
      }
      
      return {
        ...result,
        status: result.status || 'error',
        updated: false
      };
    }
    
    console.log('Status check result:', result);
    
    // Log external status information if available
    if (result.external_status !== undefined) {
      console.log(`External status code: ${result.external_status}, text: ${result.external_status_text}`);
    }
    
    return result;
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
