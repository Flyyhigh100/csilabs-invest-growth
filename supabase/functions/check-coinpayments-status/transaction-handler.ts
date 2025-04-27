
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";
import { mapCoinPaymentsStatus, getStatusDescription } from "./status-mapper.ts";

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
    console.log(`Status data result:`, JSON.stringify(result));
    
    // Map CoinPayments status to our internal status using the consistent mapper
    let newStatus = mapCoinPaymentsStatus(result.status);
    const oldStatus = transaction.status;
    
    // Log status information for debugging
    console.log(`CoinPayments status code: ${result.status}, mapped to: ${newStatus}`);
    console.log(`Current transaction status: ${oldStatus}`);
    
    // If the status hasn't changed, return early unless we're forcing an update
    if (newStatus === oldStatus && !storeExternalIds) {
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
    
    // Add completion data if the transaction is completed or confirmed
    if ((newStatus === 'completed' || newStatus === 'confirmed') && !transaction.completed_at) {
      updateData.completed_at = new Date().toISOString();
      
      // Store blockchain transaction ID if available
      if (result.send_txid) {
        updateData.blockchain_tx_id = result.send_txid;
        console.log(`Setting blockchain transaction ID: ${result.send_txid}`);
      }
    }
    
    // Store external transaction data if requested
    if (storeExternalIds && result.txn_id) {
      updateData.external_data = result;
      updateData.external_status = result.status;
      updateData.external_status_text = getStatusDescription(result.status);
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
      previousStatus: oldStatus,
      blockchain_tx_id: updateData.blockchain_tx_id
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
