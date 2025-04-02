
export const transactionOperations = {
  async markTokensSent({ transactionId }, adminClient) {
    // Use the admin client to bypass RLS
    const { data: txData, error: txError } = await adminClient
      .from("transactions")
      .update({
        token_sent: true,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", transactionId)
      .select()
      .single();
    
    if (txError) {
      throw txError;
    }
    
    return { transaction: txData };
  }
};
