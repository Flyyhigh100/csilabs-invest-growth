
// Create notification for successful payment
export async function createPaymentConfirmationNotification(
  client: any,
  userId: string,
  amount: number
) {
  try {
    const notificationData = {
      user_id: userId,
      type: 'payment_confirmed',
      title: 'Payment Confirmed',
      message: `Your payment of $${amount} has been confirmed and is being processed.`,
      read: false,
      data: { amount, confirmed_at: new Date().toISOString() }
    };
    
    const { error } = await client
      .from('notifications')
      .insert(notificationData);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}
