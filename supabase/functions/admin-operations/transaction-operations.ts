
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
  }
};
