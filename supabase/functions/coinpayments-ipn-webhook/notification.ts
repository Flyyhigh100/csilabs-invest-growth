
// Create a notification for the user when their payment is confirmed
export async function createPaymentConfirmationNotification(
  client: any,
  userId: string,
  amount: number
) {
  try {
    const { error } = await client.from('notifications').insert({
      user_id: userId,
      type: 'payment_confirmed',
      title: 'Payment Confirmed',
      message: `Your payment of ${amount} USDT has been confirmed and will be processed shortly.`,
      read: false
    });
    
    if (error) {
      console.error('Error creating payment confirmation notification:', error);
    }
  } catch (error) {
    console.error('Error in createPaymentConfirmationNotification:', error);
  }
}
