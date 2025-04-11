
import { mapCoinPaymentsStatus } from "./status-mapper.ts";
import { ensureExternalTransactionIdStored } from "./utils.ts";

export async function processTransactionStatus(
  supabase: any, 
  transaction: any, 
  statusData: any,
  storeExternalIds = true
) {
  console.log(`Processing status update for transaction ${transaction.id}`);
  
  try {
    // Skip if no result data
    if (!statusData || !statusData.result) {
      return { 
        success: false, 
        message: "No valid status data available", 
        transaction,
        updated: false
      };
    }
    
    const cpStatus = statusData.result;
    console.log(`CoinPayments status data:`, cpStatus);
    
    // Store the external transaction ID if available
    if (storeExternalIds && cpStatus.txn_id) {
      await ensureExternalTransactionIdStored(supabase, transaction, cpStatus.txn_id);
    }
    
    // Map CoinPayments status code to our internal status
    const statusCode = parseInt(cpStatus.status || '0');
    const mappedStatus = mapCoinPaymentsStatus(statusCode);
    
    console.log(`Status mapped: CP status ${statusCode} -> internal status '${mappedStatus}'`);
    
    // Skip update if status is the same and not forcing update
    if (transaction.status === mappedStatus) {
      console.log(`Transaction ${transaction.id} already has status '${mappedStatus}', skipping update`);
      return {
        success: true,
        message: "Status unchanged",
        transaction,
        updated: false,
        newStatus: mappedStatus,
        previousStatus: transaction.status
      };
    }
    
    // Update the transaction status in our database
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: mappedStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction.id);
    
    if (updateError) {
      console.error(`Error updating transaction ${transaction.id}:`, updateError);
      return {
        success: false,
        message: `Database error: ${updateError.message}`,
        transaction,
        updated: false
      };
    }
    
    console.log(`Successfully updated transaction ${transaction.id} status from '${transaction.status}' to '${mappedStatus}'`);
    
    // Create notification if status changed to completed or failed
    if (mappedStatus === 'completed' || mappedStatus === 'failed') {
      try {
        // Get user ID from transaction
        const userId = transaction.user_id;
        
        // Create notification
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: mappedStatus === 'completed' ? 'Payment Completed' : 'Payment Failed',
            message: mappedStatus === 'completed' 
              ? `Your payment of ${transaction.amount} has been confirmed.`
              : `Your payment of ${transaction.amount} has failed.`,
            type: mappedStatus === 'completed' ? 'payment_success' : 'payment_failed'
          });
        
        if (notifError) {
          console.error(`Error creating notification for user ${userId}:`, notifError);
        } else {
          console.log(`Created payment ${mappedStatus} notification for user ${userId}`);
        }
      } catch (notifError) {
        console.error(`Error in notification creation:`, notifError);
        // Continue despite notification error
      }
    }
    
    return {
      success: true,
      message: "Status updated successfully",
      transaction: {
        ...transaction,
        status: mappedStatus
      },
      updated: true,
      newStatus: mappedStatus,
      previousStatus: transaction.status
    };
    
  } catch (error) {
    console.error(`Error processing transaction status:`, error);
    return {
      success: false,
      message: `Exception: ${error.message}`,
      error: error.stack,
      transaction,
      updated: false
    };
  }
}
