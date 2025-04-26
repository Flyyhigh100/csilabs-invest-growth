
/**
 * Creates a notification for a user when payment is confirmed
 */
export async function createPaymentConfirmationNotification(supabase: any, userId: string, amount: number): Promise<boolean> {
  try {
    console.log(`Creating payment confirmation notification for user ${userId}`);
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'payment_confirmed',
        title: 'Payment Confirmed',
        message: `Your cryptocurrency payment of $${amount} has been confirmed and is being processed.`
      })
      .select()
      .single();
      
    if (error) {
      console.error(`Error creating confirmation notification: ${error.message}`);
      return false;
    }
    
    console.log(`Successfully created confirmation notification ID: ${data?.id || 'unknown'}`);
    return true;
  } catch (error) {
    console.error(`Exception creating confirmation notification: ${error.message}`);
    return false;
  }
}

/**
 * Creates a notification for a user when payment is completed
 */
export async function createPaymentCompletedNotification(supabase: any, userId: string, amount: number): Promise<boolean> {
  try {
    console.log(`Creating payment completed notification for user ${userId}`);
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'payment_success',
        title: 'Payment Completed',
        message: `Your cryptocurrency payment of $${amount} has been completed successfully.`
      })
      .select()
      .single();
      
    if (error) {
      console.error(`Error creating completed notification: ${error.message}`);
      return false;
    }
    
    console.log(`Successfully created completed notification ID: ${data?.id || 'unknown'}`);
    return true;
  } catch (error) {
    console.error(`Exception creating completed notification: ${error.message}`);
    return false;
  }
}
