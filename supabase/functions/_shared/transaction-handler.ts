
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

/**
 * Process transaction status update based on CoinPayments API response
 */
export async function processTransactionStatus(
  client: SupabaseClient,
  transaction: any,
  statusData: any,
  storeExternalIds: boolean = false
): Promise<{
  success: boolean;
  updated: boolean;
  message?: string;
  previousStatus?: string;
  newStatus?: string;
}> {
  try {
    if (!statusData.result) {
      return {
        success: false,
        updated: false,
        message: 'No result data provided'
      };
    }
    
    const { result } = statusData;
    console.log(`Processing status for transaction ${transaction.id} (${transaction.external_transaction_id})`);
    console.log(`Current status: ${transaction.status}, CP status: ${result.status}, CP status_text: ${result.status_text}`);
    
    // If transaction is already completed or settled, no need to update
    if (
      transaction.status === 'completed' || 
      transaction.status === 'confirmed'
    ) {
      console.log(`Transaction ${transaction.id} already in final state: ${transaction.status}, skipping`);
      return {
        success: true,
        updated: false,
        message: `Transaction already in final state: ${transaction.status}`
      };
    }
    
    // Map CoinPayments status to our status
    let newStatus = transaction.status;
    const previousStatus = transaction.status;
    
    // Check the status value
    switch (result.status) {
      case 0:
        // Pending
        newStatus = 'pending';
        break;
      case 1:
        // Confirmed/Complete
        newStatus = 'confirmed';
        break;
      case -1:
        // Cancelled / Timed Out
        newStatus = 'cancelled';
        break;
      case 100:
        // Complete
        newStatus = 'completed';
        break;
      default:
        console.log(`Unmapped CoinPayments status: ${result.status}, status_text: ${result.status_text}`);
        
        // For other status codes, check the textual status for more info
        if (result.status_text && result.status_text.toLowerCase().includes('cancel')) {
          newStatus = 'cancelled';
        } else if (result.status_text && (result.status_text.toLowerCase().includes('timeout') || result.status_text.toLowerCase().includes('expired'))) {
          newStatus = 'expired';
        }
    }
    
    // If status hasn't changed, we don't need to update
    if (newStatus === transaction.status) {
      console.log(`No status change for transaction ${transaction.id}, still ${newStatus}`);
      return {
        success: true,
        updated: false,
        message: 'No status change',
        previousStatus,
        newStatus
      };
    }
    
    // Prepare update data
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };
    
    // Set completed_at timestamp for final statuses
    if (['completed', 'confirmed'].includes(newStatus) && !transaction.completed_at) {
      updateData.completed_at = new Date().toISOString();
    }
    
    // Store blockchain transaction ID if available
    if (storeExternalIds && result.send_txid) {
      updateData.blockchain_tx_id = result.send_txid;
    }
    
    // Perform update
    console.log(`Updating transaction ${transaction.id} status from ${previousStatus} to ${newStatus}`);
    
    const { error } = await client
      .from('transactions')
      .update(updateData)
      .eq('id', transaction.id);
    
    if (error) {
      console.error(`Error updating transaction ${transaction.id}:`, error);
      return {
        success: false,
        updated: false,
        message: `Database error: ${error.message}`,
        previousStatus,
        newStatus
      };
    }
    
    return {
      success: true,
      updated: true,
      message: `Updated status from ${previousStatus} to ${newStatus}`,
      previousStatus,
      newStatus
    };
  } catch (error) {
    console.error('Error in processTransactionStatus:', error);
    return {
      success: false,
      updated: false,
      message: `Exception: ${error.message}`
    };
  }
}
