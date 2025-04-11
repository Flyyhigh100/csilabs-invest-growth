
// Create a notification for the user when their payment is confirmed
export async function createPaymentConfirmationNotification(
  client: any,
  userId: string,
  amount: number | string
) {
  try {
    console.log(`Creating payment confirmation notification for user ${userId}`);
    
    // Format the amount properly
    const formattedAmount = typeof amount === 'number' ? amount.toFixed(2) : amount;
    
    const { error } = await client.from('notifications').insert({
      user_id: userId,
      type: 'payment_confirmed',
      title: 'Payment Confirmed',
      message: `Your payment of ${formattedAmount} USDT has been confirmed and will be processed shortly.`,
      read: false
    });
    
    if (error) {
      console.error('Error creating payment confirmation notification:', error);
      return false;
    }
    
    console.log(`Successfully created payment notification for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error in createPaymentConfirmationNotification:', error);
    return false;
  }
}
