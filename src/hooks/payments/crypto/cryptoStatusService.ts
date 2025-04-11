
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
    // First, verify if the transaction exists in the database
    const { data: transactionCheck, error: checkError } = await supabase
      .from('transactions')
      .select('id, external_transaction_id, payment_method, transaction_id')
      .eq('id', transactionId)
      .maybeSingle();
      
    if (checkError) {
      console.error(`Database check error for transaction ${transactionId}:`, checkError);
      return {
        error: `Database error: ${checkError.message}`,
        status: 'error',
        updated: false,
        details: `Database error checking transaction ${transactionId}`
      };
    }
    
    if (!transactionCheck) {
      console.error(`Transaction ${transactionId} not found in database`);
      return {
        error: `Transaction not found in database`,
        status: 'error',
        updated: false,
        transaction_not_found: true,
        details: `Transaction ID: ${transactionId} was not found in the database`
      };
    }
    
    if (transactionCheck.payment_method !== 'coinpayments') {
      console.log(`Transaction ${transactionId} is not a CoinPayments transaction (${transactionCheck.payment_method})`);
      return {
        error: `This is not a CoinPayments transaction`,
        status: 'error',
        updated: false,
        details: `Transaction ${transactionId} has payment method: ${transactionCheck.payment_method}`
      };
    }
    
    console.log(`Database check result: ${transactionCheck ? 'Found transaction' : 'Transaction not found'}`);
    if (transactionCheck) {
      console.log(`External transaction ID: ${transactionCheck.external_transaction_id || 'none'}`);
      console.log(`Transaction ID field: ${transactionCheck.transaction_id || 'none'}`);
    }
    
    // Attempt to invoke the edge function
    console.log(`Calling edge function for transaction ${transactionId}`);
    
    try {
      // Pass both ID and transaction_id to improve chances of finding the transaction
      const { data, error } = await supabase.functions.invoke('check-coinpayments-status', {
        body: {
          transactionId,
          transaction_id: transactionCheck.transaction_id,
          external_transaction_id: transactionCheck.external_transaction_id,
          forceUpdate
        }
      });
      
      // Log the complete response for debugging
      console.log('Full edge function response:', JSON.stringify(data || {}).substring(0, 500) + '...');
      console.log('Edge function error:', error ? JSON.stringify(error) : 'None');
      
      // Determine status code from error response - Supabase Functions don't expose statusText directly
      let statusCode = error?.status || (error ? 500 : 200);
      
      // Log detailed response for debugging
      console.log(`Edge function response for transaction ${transactionId}:`, {
        data: data ? 'data present' : 'no data',
        error: error ? {
          message: error.message,
          details: error.details,
          statusCode: statusCode
        } : 'none'
      });
      
      if (data) {
        console.log(`Response data:`, JSON.stringify(data).substring(0, 200) + '...');
      }
      
      // Parse error response formats - handle both direct 'error' property and Supabase FunctionsHttpError
      const errorMessage = error?.message || (data && data.error) || null;
      
      // Check for errors
      if (error || statusCode >= 400 || errorMessage) {
        console.error('Error from edge function:', errorMessage || 'Unknown error', 'status:', statusCode);
        
        // Enhanced error details for debugging
        console.error('Full error context:', {
          errorObject: error,
          dataError: data?.error,
          statusCode: statusCode,
          transactionId: transactionId,
          apiKeyIssue: data?.api_key_issue || false
        });
        
        // Check for API key issues
        if (data?.api_key_issue || (errorMessage && (
            errorMessage.includes('API key') || 
            errorMessage.includes('API credentials') || 
            errorMessage.includes('permissions')))) {
          console.error('CoinPayments API key issue detected:', errorMessage);
          return {
            error: 'CoinPayments API key issue. Your API keys may be missing or have insufficient permissions.',
            status: 'error', 
            updated: false,
            api_key_issue: true,
            details: `API key issue: ${errorMessage}`
          };
        }
        
        // Handle 404 errors (transaction not found)
        if (statusCode === 404 || (errorMessage && errorMessage.includes('not found'))) {
          return {
            error: `Transaction not found in the payment provider (ID: ${transactionId}). Please refresh and try again.`,
            status: 'error',
            updated: false,
            transaction_not_found: true,
            details: `Transaction ID: ${transactionId} was not found. Status code: ${statusCode}`
          };
        }
        
        // Generic error response with enhanced details
        return {
          error: errorMessage || `Error from edge function (${statusCode || 'unknown status'})`,
          status: 'error',
          updated: false,
          details: `Transaction ID: ${transactionId}, Status code: ${statusCode}, Error: ${errorMessage || 'Unknown error'}`
        };
      }
      
      if (!data) {
        console.error('Empty result from edge function');
        return {
          error: 'No response from status check function',
          status: 'error',
          updated: false,
          details: `Transaction ID: ${transactionId} received empty response from edge function`
        };
      }
      
      console.log('Status check result:', data);
      
      // Log external status information if available
      if (data.external_status !== undefined) {
        console.log(`External status code: ${data.external_status}, text: ${data.external_status_text}`);
      }
      
      return data;
    } catch (functionError: any) {
      console.error(`Error invoking check-coinpayments-status function: ${functionError.message}`);
      console.error('Full error object:', JSON.stringify(functionError));
      
      return {
        error: `Error calling status check function: ${functionError.message}`,
        status: 'error',
        updated: false,
        details: `Failed to call check-coinpayments-status function: ${functionError.message}`
      };
    }
  } catch (error: any) {
    console.error('Exception in checkCryptoPaymentStatus:', error);
    
    // Enhanced error logging for network issues
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      transactionId: transactionId,
      forceUpdate: forceUpdate
    };
    console.error('Error details:', errorDetails);
    
    // Check if this is a network or CORS issue
    const errorMessage = error.message || 'Error checking payment status';
    if (errorMessage.includes('NetworkError') || errorMessage.includes('CORS')) {
      return {
        error: 'Network error. Unable to connect to the API endpoint.',
        status: 'error',
        updated: false,
        network_issue: true,
        details: `Network error: ${errorMessage}`
      };
    }
    
    return {
      error: errorMessage,
      status: 'error',
      updated: false,
      details: `Exception: ${errorMessage}, Transaction ID: ${transactionId}`
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
