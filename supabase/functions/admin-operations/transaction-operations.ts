
export const transactionOperations = {
  async markTokensSent({ transactionId, blockchainTxId }, adminClient) {
    console.log(`Marking transaction ${transactionId} as sent with blockchain TX: ${blockchainTxId}`);
    
    if (!transactionId || !blockchainTxId) {
      console.error("Missing required parameters for markTokensSent");
      throw new Error("Transaction ID and blockchain transaction ID are required");
    }
    
    try {
      // Use the admin client to bypass RLS
      const { data: txData, error: txError } = await adminClient
        .from("transactions")
        .update({
          token_sent: true,
          blockchain_tx_id: blockchainTxId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId)
        .select()
        .single();
      
      if (txError) {
        console.error("Error updating transaction:", txError);
        throw txError;
      }
      
      // Create a notification for the user about the token transfer
      if (txData) {
        const { error: notificationError } = await adminClient
          .from("notifications")
          .insert({
            user_id: txData.user_id,
            type: "tokens_sent",
            title: "Tokens Sent",
            message: `Your tokens have been sent to your wallet. Transaction ID: ${blockchainTxId}`
          });
          
        if (notificationError) {
          console.error("Error creating notification:", notificationError);
          // Continue despite notification error
        }
      }
      
      console.log("Successfully marked transaction as sent:", txData?.id);
      
      return { transaction: txData };
    } catch (error) {
      console.error("Exception in markTokensSent:", error);
      throw error;
    }
  },
  
  async getPendingTransactions(adminClient) {
    try {
      // Get transactions that are completed but tokens not sent yet
      const { data: pendingTransactions, error } = await adminClient
        .from("transactions")
        .select('*')
        .eq('status', 'completed')
        .is('token_sent', null)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching pending transactions:", error);
        throw error;
      }
      
      return { transactions: pendingTransactions || [] };
    } catch (error) {
      console.error("Exception in getPendingTransactions:", error);
      throw error;
    }
  },
  
  // New function to sync payment status with Stripe
  async syncStripePaymentStatus({ transactionId }, adminClient, stripeClient) {
    console.log(`Syncing transaction ${transactionId} with Stripe`);
    
    if (!transactionId) {
      console.error("Missing required parameter for syncStripePaymentStatus");
      throw new Error("Transaction ID is required");
    }
    
    try {
      // First, get the transaction details
      const { data: transaction, error: txError } = await adminClient
        .from("transactions")
        .select('*')
        .eq('id', transactionId)
        .single();
      
      if (txError || !transaction) {
        console.error("Error fetching transaction:", txError);
        throw txError || new Error("Transaction not found");
      }
      
      // Check if this is a Stripe payment and has an external transaction ID
      if (transaction.payment_method !== 'stripe' || !transaction.external_transaction_id) {
        return { 
          success: false, 
          message: "This transaction is not a Stripe payment or is missing payment information",
          transaction 
        };
      }
      
      // Retrieve the payment intent from Stripe
      const paymentIntent = await stripeClient.paymentIntents.retrieve(
        transaction.external_transaction_id
      );
      
      console.log(`Stripe status for payment ${transaction.external_transaction_id}: ${paymentIntent.status}`);
      
      // If the payment is succeeded in Stripe but still pending in our DB, update it
      if (paymentIntent.status === 'succeeded' && transaction.status === 'pending') {
        const { data: updatedTransaction, error: updateError } = await adminClient
          .from("transactions")
          .update({
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", transactionId)
          .select()
          .single();
        
        if (updateError) {
          console.error("Error updating transaction status:", updateError);
          throw updateError;
        }
        
        // Create a notification for the user
        const { error: notifError } = await adminClient
          .from('notifications')
          .insert({
            user_id: transaction.user_id,
            type: 'payment_confirmed',
            title: 'Payment Confirmed',
            message: `Your payment of $${transaction.amount.toFixed(2)} has been confirmed.`
          });
          
        if (notifError) {
          console.error("Error creating notification:", notifError);
          // Continue despite notification error
        }
        
        return { 
          success: true, 
          message: "Payment status successfully updated to completed", 
          transaction: updatedTransaction,
          stripeStatus: paymentIntent.status
        };
      }
      
      // If status is already completed or payment is not succeeded in Stripe
      return { 
        success: false, 
        message: paymentIntent.status === 'succeeded' ? 
          "Transaction is already marked as completed" : 
          `Payment is not succeeded in Stripe (status: ${paymentIntent.status})`,
        transaction,
        stripeStatus: paymentIntent.status
      };
    } catch (error) {
      console.error("Exception in syncStripePaymentStatus:", error);
      throw error;
    }
  },

  // Update this function to handle cases where completed_at column might not exist
  async manuallyCompleteTransaction({ transactionId, externalTransactionId }, adminClient) {
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
  }
};
