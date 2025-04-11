
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
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10); // Increased limit to check more recent transactions
      
    if (error) {
      console.error(`[WEBHOOK] Error finding recent pending transactions: ${error.message}`);
      return [];
    }
    
    if (data && data.length > 0) {
      console.log(`[WEBHOOK] Found ${data.length} recent pending transactions, checking for matches`);
      
      // Log all recent transactions for debugging
      data.forEach((tx: any, idx: number) => {
        console.log(`[WEBHOOK] Recent pending tx #${idx+1}:`, JSON.stringify({
          id: tx.id,
          transaction_id: tx.transaction_id,
          external_transaction_id: tx.external_transaction_id,
          status: tx.status,
          created_at: tx.created_at
        }));
      });
    } else {
      console.log('[WEBHOOK] No recent pending transactions found');
    }
    
    return data || [];
  } catch (err) {
    console.error(`[WEBHOOK] Error finding recent pending transactions: ${err.message}`);
    return [];
  }
};
