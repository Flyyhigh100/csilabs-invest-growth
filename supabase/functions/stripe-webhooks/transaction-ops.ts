
// Update transaction status to completed
export const updateTransactionStatus = async (supabase: any, transaction: any, paymentIntentId = null) => {
  if (!transaction) return null;
  
  // Log detailed status change information
  console.log(`[WEBHOOK] STATUS UPDATE: Changing transaction ${transaction.id} status from "${transaction.status}" to "completed"`);
  console.log(`[WEBHOOK] Transaction details: ${JSON.stringify({
    tx_id: transaction.id,
    current_status: transaction.status,
    user_id: transaction.user_id,
    amount: transaction.amount,
    wallet_address: transaction.wallet_address
  })}`);
  
  try {
    const updateData: any = {
      status: 'completed',
      updated_at: new Date().toISOString(),
      token_sent: false
    };
    
    // Add payment intent ID if provided
    if (paymentIntentId) {
      updateData.external_transaction_id = paymentIntentId;
    }
    
    // Log the exact query we're about to execute
    console.log(`[WEBHOOK] Executing update on 'transactions' table with data: ${JSON.stringify(updateData)}`);
    console.log(`[WEBHOOK] WHERE id = '${transaction.id}'`);
    
    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transaction.id)
      .select()
      .single();
      
    if (error) {
      console.error(`[WEBHOOK] Error updating transaction: ${error.message}`, error);
      
      // Attempt direct database verification to see if status was actually updated
      const { data: verificationData, error: verificationError } = await supabase
        .from('transactions')
        .select('id, status, updated_at')
        .eq('id', transaction.id)
        .single();
      
      if (verificationError) {
        console.error(`[WEBHOOK] Verification check failed: ${verificationError.message}`);
      } else {
        console.log(`[WEBHOOK] Current transaction state in DB: ${JSON.stringify(verificationData)}`);
        
        // If verification shows status is completed despite update error, consider it a success
        if (verificationData?.status === 'completed') {
          console.log(`[WEBHOOK] Transaction status appears to be completed despite update error.`);
          return verificationData;
        }
      }
      
      throw error;
    }
    
    console.log(`[WEBHOOK] Successfully updated transaction status for ID ${transaction.id}`, 
      JSON.stringify({
        tx_id: data.id,
        new_status: data.status,
        updated_at: data.updated_at,
        payment_intent: data.external_transaction_id
      })
    );
    
    return data;
  } catch (err) {
    console.error(`[WEBHOOK] Error in transaction update: ${err.message}`);
    console.error(err.stack || 'No stack trace available');
    throw err;
  }
};

// Find transaction by session ID
export const findTransactionBySessionId = async (supabase: any, sessionId: string) => {
  console.log(`[WEBHOOK] Checking transaction with session ID: ${sessionId}`);
  
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('transaction_id', sessionId)
      .maybeSingle();
      
    if (error) {
      console.error(`[WEBHOOK] Error fetching transaction by session ID: ${error.message}`);
      throw error;
    }
    
    if (data) {
      console.log(`[WEBHOOK] Found transaction by session ID: ${JSON.stringify({
        id: data.id,
        status: data.status,
        amount: data.amount
      })}`);
    } else {
      console.log(`[WEBHOOK] No transaction found with session ID: ${sessionId}`);
    }
    
    return data;
  } catch (err) {
    console.error(`[WEBHOOK] Error finding transaction by session ID: ${err.message}`);
    return null;
  }
};

// Find transaction by payment intent ID
export const findTransactionByPaymentIntent = async (supabase: any, paymentIntentId: string) => {
  try {
    console.log(`[WEBHOOK] Searching for transaction with payment intent ID: ${paymentIntentId}`);
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('external_transaction_id', paymentIntentId)
      .maybeSingle();
      
    if (error) {
      console.error(`[WEBHOOK] Error finding transaction by payment intent: ${error.message}`);
    }
    
    if (data) {
      console.log(`[WEBHOOK] Found transaction by payment intent: ${JSON.stringify({
        id: data.id,
        status: data.status,
        amount: data.amount
      })}`);
    } else {
      console.log(`[WEBHOOK] No transaction found with payment intent ID: ${paymentIntentId}`);
    }
    
    return data;
  } catch (err) {
    console.error(`[WEBHOOK] Error finding transaction by payment intent: ${err.message}`);
    return null;
  }
};

// Create new transaction from session data
export const createTransactionFromSession = async (supabase: any, session: any) => {
  if (!session.metadata?.user_id || !session.metadata?.wallet_address) {
    console.error(`[WEBHOOK] Cannot create transaction record: missing user_id or wallet_address in metadata`, 
      JSON.stringify(session.metadata)
    );
    return null;
  }
  
  try {
    const insertData = {
      user_id: session.metadata.user_id,
      amount: (session.amount_total / 100),
      wallet_address: session.metadata.wallet_address,
      payment_method: 'stripe',
      status: 'completed', // Explicitly set status to completed
      transaction_id: session.id,
      external_transaction_id: session.payment_intent || null,
      token_sent: false,
      completed_at: session.payment_status === 'paid' ? new Date().toISOString() : null // Set completed_at when paid
    };
    
    console.log(`[WEBHOOK] Creating new transaction with data:`, JSON.stringify(insertData));
    
    const { data, error } = await supabase
      .from('transactions')
      .insert(insertData)
      .select()
      .single();
      
    if (error) {
      console.error(`[WEBHOOK] Error creating transaction from webhook: ${error.message}`);
      throw error;
    }
    
    console.log(`[WEBHOOK] Successfully created transaction record from webhook data`, JSON.stringify({
      tx_id: data.id,
      amount: data.amount,
      status: data.status,
      external_transaction_id: data.external_transaction_id // Log this to verify it's stored
    }));
    
    return data;
  } catch (err) {
    console.error(`[WEBHOOK] Error in transaction creation: ${err.message}`);
    return null;
  }
};

// CRITICAL: Direct update method for external transaction ID
export const forceUpdateExternalTransactionId = async (supabase: any, transactionId: string, paymentIntentId: string) => {
  if (!transactionId || !paymentIntentId) {
    console.error(`[CRITICAL] Cannot update external_transaction_id: Missing transaction ID or payment intent ID`);
    return null;
  }

  console.log(`[CRITICAL] FORCE UPDATING external_transaction_id for transaction ${transactionId} to ${paymentIntentId}`);
  
  try {
    // Direct update query to specifically set the external_transaction_id
    const updateData = {
      external_transaction_id: paymentIntentId,
      status: 'completed',
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };
    
    console.log(`[CRITICAL] Executing force update with data:`, JSON.stringify(updateData));
    
    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId)
      .select('id, external_transaction_id, status')
      .single();
    
    if (error) {
      console.error(`[CRITICAL] Failed to force update external_transaction_id: ${error.message}`);
      
      // Try a simplified update with just the external_transaction_id as a last resort
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('transactions')
        .update({ external_transaction_id: paymentIntentId })
        .eq('id', transactionId)
        .select('id, external_transaction_id')
        .single();
      
      if (fallbackError) {
        console.error(`[CRITICAL] Even simplified update failed: ${fallbackError.message}`);
        return null;
      }
      
      console.log(`[CRITICAL] Simplified update succeeded:`, fallbackData);
      return fallbackData;
    }
    
    console.log(`[CRITICAL] Force update succeeded:`, data);
    
    // Verify the update actually worked
    const { data: verifyData, error: verifyError } = await supabase
      .from('transactions')
      .select('id, external_transaction_id, status')
      .eq('id', transactionId)
      .single();
    
    if (verifyError) {
      console.error(`[CRITICAL] Verification query failed: ${verifyError.message}`);
    } else {
      console.log(`[CRITICAL] Verification result:`, verifyData);
    }
    
    return data;
  } catch (err) {
    console.error(`[CRITICAL] Exception in force update: ${err.message}`);
    console.error(err.stack || 'No stack trace available');
    return null;
  }
};
