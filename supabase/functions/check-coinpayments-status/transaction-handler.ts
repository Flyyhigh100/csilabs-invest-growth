
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

/**
 * Process transaction status data from CoinPayments API and update our database
 */
export async function processTransactionStatus(
  supabase: SupabaseClient,
  transaction: any,
  statusData: any,
  storeExternalIds: boolean = true
): Promise<any> {
  try {
    console.log(`Processing status for transaction ${transaction.id}`);
    
    if (!transaction || !statusData || !statusData.result) {
      console.error('Missing required transaction or status data');
      return {
        success: false,
        message: 'Missing required transaction or status data',
        updated: false
      };
    }
    
    // Extract status data from the CoinPayments API response
    const result = statusData.result;
    console.log(`Status data result:`, JSON.stringify(result).substring(0, 200) + '...');
    
    // Map CoinPayments status to our internal status
    let newStatus = mapCoinPaymentsStatus(result.status);
    const oldStatus = transaction.status;
    
    // If the status hasn't changed, return early with updated=false
    if (newStatus === oldStatus) {
      console.log(`Transaction ${transaction.id} status unchanged: ${oldStatus}`);
      return {
        success: true,
        message: `Transaction status unchanged: ${oldStatus}`,
        updated: false,
        transaction: transaction,
        newStatus: newStatus,
        previousStatus: oldStatus
      };
    }
    
    console.log(`Updating transaction ${transaction.id} status from ${oldStatus} to ${newStatus}`);
    
    // Prepare update data
    const updateData: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };
    
    // Store external transaction data if requested
    if (storeExternalIds && result.txn_id) {
      updateData.external_data = result;
      updateData.external_status = result.status;
      updateData.external_status_text = mapCoinPaymentsStatusToText(result.status);
    }
    
    // Update the transaction in the database
    const { data: updatedTransaction, error: updateError } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transaction.id)
      .select('*')
      .single();
    
    if (updateError) {
      console.error(`Error updating transaction ${transaction.id}:`, updateError);
      return {
        success: false,
        message: `Database error: ${updateError.message}`,
        updated: false
      };
    }
    
    console.log(`Successfully updated transaction ${transaction.id} status to ${newStatus}`);
    
    return {
      success: true,
      message: `Transaction status updated from ${oldStatus} to ${newStatus}`,
      updated: true,
      transaction: updatedTransaction,
      newStatus: newStatus,
      previousStatus: oldStatus
    };
  } catch (error) {
    console.error('Error processing transaction status:', error);
    return {
      success: false,
      message: `Exception: ${error.message || 'Unknown error'}`,
      updated: false
    };
  }
}

/**
 * Maps CoinPayments numeric status to our internal status string
 */
function mapCoinPaymentsStatus(statusCode: number): string {
  switch (statusCode) {
    case -1: return 'cancelled';    // Cancelled / Timed Out
    case 0:  return 'pending';      // Waiting for buyer funds
    case 1:  return 'pending';      // Funds received, waiting for confirmation
    case 2:  return 'completed';    // Confirmed and completed
    case 3:  return 'completed';    // Complete - Sent to Receiver
    case 100: return 'completed';   // Complete
    default: return 'pending';      // Default to pending for unknown status
  }
}

/**
 * Maps CoinPayments numeric status codes to readable text
 */
function mapCoinPaymentsStatusToText(statusCode: number): string {
  switch (statusCode) {
    case -1: return 'Cancelled / Timed Out';
    case 0:  return 'Waiting for buyer to send funds';
    case 1:  return 'Funds received, waiting for confirmations';
    case 2:  return 'Confirmed and completed';
    case 3:  return 'Complete - Funds sent to receiver';
    case 100: return 'Complete';
    default: return `Unknown status (${statusCode})`;
  }
}
