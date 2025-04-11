
// Create notification for user when payment is confirmed
export async function createPaymentConfirmationNotification(supabase: any, userId: string, amount: number | string) {
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
}
