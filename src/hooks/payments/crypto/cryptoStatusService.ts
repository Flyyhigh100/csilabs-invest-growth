
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
    const response = await supabase.functions.invoke('check-coinpayments-status', {
      body: {
        transactionId,
        forceUpdate
      }
    });
    
    // Extract status code, data and error from response
    const data = response.data;
    const error = response.error;
    const statusCode = typeof response?.statusText === 'string' ? 
                      (response.statusText.includes('404') ? 404 : 
                       response.statusText.includes('401') ? 401 : 
                       response.statusText.includes('400') ? 400 : 500) : 500;
    
    // Log detailed response for debugging
    console.log(`Edge function response:`, {
      data: data || 'none',
      error: error ? {
        message: error.message,
        details: error.details,
        statusCode: statusCode
      } : 'none'
    });
    
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
        transactionId: transactionId
      });
      
      // Handle 404 errors (transaction not found)
      if (statusCode === 404 || (errorMessage && errorMessage.includes('not found'))) {
        return {
          error: 'Transaction not found in the database. Please refresh the page and try again.',
          status: 'error',
          updated: false,
          transaction_not_found: true,
          details: `Transaction ID: ${transactionId} was not found. Status code: ${statusCode}`
        };
      }
      
      // Handle general API errors
      if (errorMessage) {
        if (errorMessage.includes('API call to CoinPayments failed')) {
          return {
            error: 'CoinPayments API error. Your API keys may be invalid or have insufficient permissions.',
            status: 'error', 
            updated: false,
            api_key_issue: true,
            details: `Error with CoinPayments API: ${errorMessage}`
          };
        }
        
        if (errorMessage.includes('API credentials') || errorMessage.includes('API key')) {
          return {
            error: 'CoinPayments API credentials issue. Please verify your API keys configuration.',
            status: 'error',
            updated: false,
            api_key_issue: true,
            details: `API credentials issue: ${errorMessage}`
          };
        }
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
