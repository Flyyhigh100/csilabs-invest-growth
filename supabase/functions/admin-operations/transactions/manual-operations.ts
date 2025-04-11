// Functions related to manual transaction operations
export const manuallyCompleteTransaction = async ({ transactionId, externalTransactionId }, adminClient) => {
  console.log(`Manually completing transaction with CoinPayments ID: ${externalTransactionId}`);
  
  try {
    // First try to find the transaction by external_transaction_id (CoinPayments ID)
    let query = adminClient.from("transactions").select('*');
    
    // If we have transactionId (database ID), use that
    if (transactionId) {
      console.log(`Looking up by database transaction ID: ${transactionId}`);
      query = query.eq('id', transactionId);
    } 
    // Otherwise use external transaction ID
    else if (externalTransactionId) {
      console.log(`Looking up by external transaction ID: ${externalTransactionId}`);
      query = query.eq('external_transaction_id', externalTransactionId);
    } else {
      throw new Error("Either transaction ID or external transaction ID is required");
    }
    
    // Execute the query
    const { data: transaction, error: txError } = await query.maybeSingle();
    
    if (txError) {
      console.error("Error fetching transaction:", txError);
      throw txError;
    }
    
    if (!transaction) {
      console.error("Transaction not found");
      return { 
        success: false, 
        message: "Transaction not found with the provided ID"
      };
    }
    
    // Already completed? Nothing to do
    if (transaction.status === 'completed') {
      return { 
        success: false, 
        message: "Transaction is already marked as completed",
        transaction
      };
    }
    
    console.log(`Found transaction ${transaction.id} with current status: ${transaction.status}`);
    
    // Update the transaction status to completed
    // Create update object with required fields
    const updateData = {
      status: "completed",
      updated_at: new Date().toISOString()
    };
    
    // Add completed_at if possible (in a try/catch to handle missing column case)
    try {
      updateData.completed_at = new Date().toISOString();
    } catch (e) {
      console.log("Note: 'completed_at' column may not exist yet, continuing without it");
    }
    
    // Use let instead of const for the updatedTransaction variable since we might reassign it
    let { data: updatedTransaction, error: updateError } = await adminClient
      .from("transactions")
      .update(updateData)
      .eq("id", transaction.id)
      .select()
      .single();
    
    if (updateError) {
      console.error("Error updating transaction status:", updateError);
      
      // If the error is specifically about the completed_at column, try again without it
      if (updateError.message && updateError.message.includes('completed_at')) {
        console.log("Retrying update without completed_at field");
        
        const { data: retryTransaction, error: retryError } = await adminClient
          .from("transactions")
          .update({
            status: "completed",
            updated_at: new Date().toISOString()
          })
          .eq("id", transaction.id)
          .select()
          .single();
          
        if (retryError) {
          console.error("Error in retry update:", retryError);
          throw retryError;
        }
        
        updatedTransaction = retryTransaction;
      } else {
        throw updateError;
      }
    }
    
    console.log(`Successfully updated transaction ${transaction.id} status to completed`);
    
    // Create a notification for the user
    const { error: notifError } = await adminClient
      .from('notifications')
      .insert({
        user_id: transaction.user_id,
        type: 'payment_confirmed',
        title: 'Payment Completed',
        message: `Your payment of $${transaction.amount} has been marked as completed.`
      });
      
    if (notifError) {
      console.error("Error creating notification:", notifError);
      // Continue despite notification error
    }
    
    return { 
      success: true, 
      message: "Transaction status successfully updated to completed", 
      transaction: updatedTransaction,
      previousStatus: transaction.status
    };
  } catch (error) {
    console.error("Exception in manuallyCompleteTransaction:", error);
    throw error;
  }
};
