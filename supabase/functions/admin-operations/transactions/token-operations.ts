
// Functions related to token sending and marking tokens as sent
export const markTokensSent = async ({ transactionId, blockchainTxId }, adminClient) => {
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
      // Calculate token amount if available
      const tokenAmount = txData.token_amount || 
        (txData.token_price && txData.token_price > 0 ? 
          txData.amount / txData.token_price : null);
      
      // Format token amount for the message
      const tokenText = tokenAmount 
        ? `${tokenAmount.toFixed(2)} CSI tokens`
        : "your tokens";
      
      // Determine which blockchain explorer to use based on transaction data
      // Note: This assumes you're storing blockchain network info somewhere or inferring it
      const isSolana = blockchainTxId.startsWith('sol:') || 
                      txData.payment_method?.toLowerCase().includes('solana');
      
      const explorerName = isSolana ? 'Solscan' : 'PolygonScan';
      const txIdDisplay = blockchainTxId.slice(0, 8) + '...' + blockchainTxId.slice(-6);
      
      const { error: notificationError } = await adminClient
        .from("notifications")
        .insert({
          user_id: txData.user_id,
          type: "tokens", // Use consistent type for token notifications
          title: "CSI Tokens Delivered",
          message: `${tokenText} have been sent to your wallet. You can verify the transaction on ${explorerName} with ID: ${txIdDisplay}`
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
};
