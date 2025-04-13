// CORS headers for all responses
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create notification for user when payment is confirmed
export const createPaymentConfirmationNotification = async (supabase: any, userId: string, amount: number | string) => {
  try {
    console.log(`[WEBHOOK] Creating notification for user ${userId} about payment of $${amount}`);
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'payment_confirmed',
        title: 'Payment Confirmed',
        message: `Your payment of $${typeof amount === 'number' ? amount.toFixed(2) : amount} has been confirmed. Tokens will be sent to your wallet shortly.`
      })
      .select();
      
    if (error) {
      console.error(`[WEBHOOK] Error creating notification: ${error.message}`);
      return false;
    }
    
    console.log(`[WEBHOOK] Successfully created notification ${data[0].id} for user ${userId}`);
    return true;
  } catch (err) {
    console.error(`[WEBHOOK] Error in notification creation: ${err.message}`);
    return false;
  }
};

// Find recent pending transactions
export const findRecentPendingTransactions = async (supabase: any) => {
  try {
    console.log(`[CRITICAL] Searching for all recent pending transactions to match against payment`);
    
    // Look for transactions created within the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const timestampFilter = oneDayAgo.toISOString();
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'pending')
      .gte('created_at', timestampFilter) // Only transactions from the last 24 hours
      .order('created_at', { ascending: false })
      .limit(20); // Increased limit to check more recent transactions
      
    if (error) {
      console.error(`[CRITICAL] Error finding recent pending transactions: ${error.message}`);
      return [];
    }
    
    if (data && data.length > 0) {
      console.log(`[CRITICAL] Found ${data.length} recent pending transactions from the last 24 hours`);
      
      // Log all recent transactions for debugging
      data.forEach((tx: any, idx: number) => {
        console.log(`[CRITICAL] Recent pending tx #${idx+1}:`, JSON.stringify({
          id: tx.id,
          amount: tx.amount,
          transaction_id: tx.transaction_id, 
          wallet_address: tx.wallet_address,
          external_transaction_id: tx.external_transaction_id,
          status: tx.status,
          created_at: tx.created_at
        }));
      });
    } else {
      console.log('[CRITICAL] No recent pending transactions found in the last 24 hours');
    }
    
    return data || [];
  } catch (err) {
    console.error(`[CRITICAL] Error finding recent pending transactions: ${err.message}`);
    return [];
  }
};
