
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if this is a status check request
  const url = new URL(req.url);
  if (url.pathname.endsWith('/status')) {
    return await handleStatusCheck(req);
  }

  // Get request data
  const { amount, walletAddress } = await req.json();
  
  if (!amount || amount <= 0 || !walletAddress) {
    return new Response(
      JSON.stringify({ error: 'Invalid amount or missing wallet address' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Error getting user or user not found');
    }

    console.log(`Creating crypto payment for user ${user.id}, amount: $${amount}`);

    // For testing purposes, we'll simulate a crypto payment process
    // In production, you would integrate with a real crypto payment processor
    
    // Generate a payment address (in production, this would be a real address)
    const paymentAddress = "0x" + Array(40).fill(0).map(() => 
      Math.floor(Math.random() * 16).toString(16)).join('');
      
    // Generate a unique transaction ID
    const transactionId = crypto.randomUUID();

    // Log the transaction in the transactions table
    const { error: insertError } = await supabaseClient.from('transactions').insert({
      user_id: user.id,
      amount: amount,
      wallet_address: walletAddress,
      payment_method: 'crypto',
      status: 'pending',
      transaction_id: transactionId,
      payment_address: paymentAddress
    });

    if (insertError) {
      console.error('Error inserting transaction record:', insertError);
      throw new Error('Failed to record transaction');
    }

    console.log(`Crypto payment created: ${transactionId}`);

    // In a real implementation, we would set up a callback or webhook to be notified when the transaction is confirmed

    return new Response(
      JSON.stringify({ 
        paymentAddress: paymentAddress,
        amount: amount,
        transactionId: transactionId,
        instructions: "Send USDC tokens to this address to complete your purchase. For testing, no actual payment is required.",
        checkStatusUrl: `${url.origin}${url.pathname}/status?txid=${transactionId}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error creating crypto payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Handler for checking transaction status
async function handleStatusCheck(req: Request) {
  try {
    const url = new URL(req.url);
    const txid = url.searchParams.get('txid');
    
    if (!txid) {
      return new Response(
        JSON.stringify({ error: 'Missing transaction ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );
    
    // Get the current transaction status
    const { data: transaction, error } = await supabaseClient
      .from('transactions')
      .select('status, created_at, payment_method, amount')
      .eq('transaction_id', txid)
      .single();
    
    if (error || !transaction) {
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // If transaction is pending and older than 1 minute, randomly mark as completed or failed for demo purposes
    // In a real implementation, this would check the blockchain or payment provider API
    if (transaction.status === 'pending') {
      const createdAt = new Date(transaction.created_at);
      const now = new Date();
      const minutesPassed = (now.getTime() - createdAt.getTime()) / (1000 * 60);
      
      if (minutesPassed > 1) {
        // For demo purposes, randomly complete or fail the transaction
        const newStatus = Math.random() > 0.3 ? 'completed' : 'failed';
        
        await supabaseClient
          .from('transactions')
          .update({ status: newStatus })
          .eq('transaction_id', txid);
        
        transaction.status = newStatus;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        transactionId: txid,
        status: transaction.status,
        amount: transaction.amount,
        paymentMethod: transaction.payment_method,
        updatedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}
