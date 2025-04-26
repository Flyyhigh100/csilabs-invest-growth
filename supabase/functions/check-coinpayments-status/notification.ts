
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

/**
 * Creates a payment confirmation notification for a user
 */
export async function createPaymentConfirmationNotification(
  supabase: any,
  userId: string,
  amount: number
) {
  try {
    const notificationType = 'payment_confirmation';
    const title = 'Payment Confirmed';
    const message = `Your payment of $${amount} has been confirmed.`;
    
    console.log(`Creating notification for user ${userId}: ${message}`);

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: notificationType,
        title: title,
        message: message,
        is_read: false
      });

    if (error) {
      console.error('Error creating notification:', error);
    } else {
      console.log('Notification created successfully');
    }
  } catch (error) {
    console.error('Error in createPaymentConfirmationNotification:', error);
  }
}

/**
 * Creates a payment failed notification for a user
 */
export async function createPaymentFailedNotification(
  supabase: any,
  userId: string,
  amount: number,
  reason: string = 'Unknown reason'
) {
  try {
    const notificationType = 'payment_failed';
    const title = 'Payment Failed';
    const message = `Your payment of $${amount} has failed. Reason: ${reason}`;
    
    console.log(`Creating failed payment notification for user ${userId}: ${message}`);

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: notificationType,
        title: title,
        message: message,
        is_read: false
      });

    if (error) {
      console.error('Error creating notification:', error);
    } else {
      console.log('Notification created successfully');
    }
  } catch (error) {
    console.error('Error in createPaymentFailedNotification:', error);
  }
}
