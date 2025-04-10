
export const transactionOperations = {
  async markTokensSent({ transactionId, blockchainTxId }, adminClient) {
    console.log(`Marking transaction ${transactionId} as sent with blockchain TX: ${blockchainTxId}`);
    
    if (!transactionId || !blockchainTxId) {
      console.error("Missing required parameters for markTokensSent");
      throw new Error("Transaction ID and blockchain transaction ID are required");
    }
    
    // Use the admin client to bypass RLS
    const { data: txData, error: txError } = await adminClient
      .from("transactions")
      .update({
        token_sent: true,
        status: "completed",
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
    
    console.log("Successfully marked transaction as sent:", txData?.id);
    
    return { transaction: txData };
  }
};
