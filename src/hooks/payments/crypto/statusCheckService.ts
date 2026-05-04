
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { CryptoStatusCheckResult } from './types';

/**
 * Calls the edge function to check a crypto payment status
 */
export async function checkCryptoPaymentStatus(
  transactionId: string,
  forceUpdate: boolean = false
): Promise<CryptoStatusCheckResult> {
  console.log(`[disabled] Skipping CoinPayments status check for ${transactionId} (forceUpdate=${forceUpdate}). Platform is on White Glove flow.`);

  // Short-circuit: CoinPayments live polling is disabled while purchases run through
  // the White Glove concierge flow. Return a benign "pending" result so existing
  // pollers/UI don't surface 404/503 errors or blank screens.
  return {
    status: 'pending',
    updated: false,
    details: 'CoinPayments live status polling is disabled.',
  } as CryptoStatusCheckResult;

  // eslint-disable-next-line no-unreachable
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
      
      // Handle the response and errors
      return handleEdgeFunctionResponse(data, error, transactionId);
      
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
    
    return handleGenericError(error);
  }
}

/**
 * Process the edge function response
 */
function handleEdgeFunctionResponse(data: any, error: any, transactionId: string): CryptoStatusCheckResult {
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
}

/**
 * Handle generic errors, particularly network-related issues
 */
function handleGenericError(error: any): CryptoStatusCheckResult {
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
    details: `Exception: ${errorMessage}`
  };
}
