
// Functions related to fetching transactions
export const getPendingTransactions = async (adminClient) => {
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
};
