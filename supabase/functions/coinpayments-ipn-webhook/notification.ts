
import { createDbClient } from "./db-client.ts";

export async function createPaymentConfirmationNotification(
  userId: string,
  transactionId: string,
  status: string,
  amount: number | string
) {
  console.log(`Creating payment notification for user ${userId}, transaction ${transactionId}, status: ${status}`);
  
  try {
    const supabase = createDbClient();
    
    let title = '';
    let message = '';
    let notificationType = 'payment';
    
    // Create different messages based on payment status
    switch (status) {
      case 'completed':
        title = 'Crypto Payment Confirmed';
        message = `🎉 Your cryptocurrency payment of $${Number(amount).toFixed(2)} has been successfully confirmed! Your CSI tokens will be sent to your wallet shortly.`;
        notificationType = 'payment';
        break;
        
      case 'failed':
        title = 'Payment Failed';
        message = `❌ Your cryptocurrency payment of $${Number(amount).toFixed(2)} has failed or was cancelled. Please try again or contact support if you need assistance.`;
        notificationType = 'payment';
        break;
        
      case 'pending':
        title = 'Payment Processing';
        message = `⏳ Your cryptocurrency payment of $${Number(amount).toFixed(2)} is being processed. You'll receive another notification once it's confirmed.`;
        notificationType = 'payment';
        break;
        
      default:
        title = 'Payment Status Update';
        message = `Your cryptocurrency payment of $${Number(amount).toFixed(2)} status has been updated to: ${status}`;
        notificationType = 'other';
    }
    
    // Insert the notification into the database
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: notificationType,
        title: title,
        message: message,
        read: false,
        is_test: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating payment notification:', error);
      return { success: false, error: error.message };
    }
    
    console.log(`Successfully created payment notification: ${data.id}`);
    return { success: true, notification: data };
    
  } catch (error) {
    console.error('Exception in createPaymentConfirmationNotification:', error);
    return { success: false, error: error.message };
  }
}

// Create notification for payment status changes
export async function createPaymentStatusNotification(
  userId: string,
  transactionId: string,
  oldStatus: string,
  newStatus: string,
  amount: number | string
) {
  console.log(`Creating status change notification: ${oldStatus} -> ${newStatus}`);
  
  // Only create notifications for meaningful status changes
  if (oldStatus === newStatus) {
    return { success: true, message: 'No status change, notification skipped' };
  }
  
  // Create the appropriate notification based on the new status
  return await createPaymentConfirmationNotification(userId, transactionId, newStatus, amount);
}
