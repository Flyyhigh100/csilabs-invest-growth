
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
    
    // Create enhanced notification for the user about the token transfer
    if (txData) {
      await createTokenDeliveryNotification(adminClient, txData, blockchainTxId);
    }
    
    console.log("Successfully marked transaction as sent:", txData?.id);
    
    return { transaction: txData };
  } catch (error) {
    console.error("Exception in markTokensSent:", error);
    throw error;
  }
};

// Enhanced token delivery notification function
async function createTokenDeliveryNotification(adminClient, transaction, blockchainTxId) {
  try {
    // Calculate token amount if available
    const tokenAmount = transaction.token_amount || 
      (transaction.token_price && transaction.token_price > 0 ? 
        transaction.amount / transaction.token_price : null);
    
    // Format token amount for the message
    const tokenText = tokenAmount 
      ? `${Number(tokenAmount).toLocaleString()} CSI tokens`
      : "your CSI tokens";
    
    // Determine blockchain explorer link
    const isSolana = blockchainTxId.includes('solana') || 
                    transaction.payment_method?.toLowerCase().includes('solana');
    
    const explorerUrl = isSolana 
      ? `https://solscan.io/tx/${blockchainTxId}`
      : `https://polygonscan.com/tx/${blockchainTxId}`;
    
    const explorerName = isSolana ? 'Solscan' : 'PolygonScan';
    const txIdDisplay = blockchainTxId.length > 20 
      ? blockchainTxId.slice(0, 8) + '...' + blockchainTxId.slice(-6)
      : blockchainTxId;
    
    const { error: notificationError } = await adminClient
      .from("notifications")
      .insert({
        user_id: transaction.user_id,
        type: "tokens",
        title: "CSI Tokens Delivered Successfully",
        message: `🎉 ${tokenText} have been successfully sent to your wallet (${transaction.wallet_address?.slice(0, 6)}...${transaction.wallet_address?.slice(-4)}). Transaction ID: ${txIdDisplay}. You can verify the transaction on ${explorerName}.`,
        read: false,
        is_test: transaction.is_test || false
      });
      
    if (notificationError) {
      console.error("Error creating token delivery notification:", notificationError);
    } else {
      console.log(`Successfully created token delivery notification for user ${transaction.user_id}`);
    }
  } catch (error) {
    console.error("Error in createTokenDeliveryNotification:", error);
  }
}
