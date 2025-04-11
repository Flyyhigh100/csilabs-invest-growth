
// Functions related to syncing payment status with providers
export const syncStripePaymentStatus = async ({ transactionId }, adminClient, stripeClient) => {
  console.log(`Syncing transaction ${transactionId} with Stripe`);
  
  if (!transactionId) {
    console.error("Missing required parameter for syncStripePaymentStatus");
    throw new Error("Transaction ID is required");
  }
  
  try {
    // First, get the transaction details
    const { data: transaction, error: txError } = await adminClient
      .from("transactions")
      .select('*')
      .eq('id', transactionId)
      .single();
    
    if (txError || !transaction) {
      console.error("Error fetching transaction:", txError);
      throw txError || new Error("Transaction not found");
    }
    
    // Check if this is a Stripe payment and has an external transaction ID
    if (transaction.payment_method !== 'stripe' || !transaction.external_transaction_id) {
      return { 
        success: false, 
        message: "This transaction is not a Stripe payment or is missing payment information",
        transaction 
      };
    }
    
    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripeClient.paymentIntents.retrieve(
      transaction.external_transaction_id
    );
    
    console.log(`Stripe status for payment ${transaction.external_transaction_id}: ${paymentIntent.status}`);
    
    // If the payment is succeeded in Stripe but still pending in our DB, update it
    if (paymentIntent.status === 'succeeded' && transaction.status === 'pending') {
      const { data: updatedTransaction, error: updateError } = await adminClient
        .from("transactions")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId)
        .select()
        .single();
      
      if (updateError) {
        console.error("Error updating transaction status:", updateError);
        throw updateError;
      }
      
      // Create a notification for the user
      const { error: notifError } = await adminClient
        .from('notifications')
        .insert({
          user_id: transaction.user_id,
          type: 'payment_confirmed',
          title: 'Payment Confirmed',
          message: `Your payment of $${transaction.amount.toFixed(2)} has been confirmed.`
        });
        
      if (notifError) {
        console.error("Error creating notification:", notifError);
        // Continue despite notification error
      }
      
      return { 
        success: true, 
        message: "Payment status successfully updated to completed", 
        transaction: updatedTransaction,
        stripeStatus: paymentIntent.status
      };
    }
    
    // If status is already completed or payment is not succeeded in Stripe
    return { 
      success: false, 
      message: paymentIntent.status === 'succeeded' ? 
        "Transaction is already marked as completed" : 
        `Payment is not succeeded in Stripe (status: ${paymentIntent.status})`,
      transaction,
      stripeStatus: paymentIntent.status
    };
  } catch (error) {
    console.error("Exception in syncStripePaymentStatus:", error);
    throw error;
  }
};
