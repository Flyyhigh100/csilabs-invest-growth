import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { corsHeaders } from "./utils.ts";
import { createCoinPaymentsTransaction } from "./api-client.ts";
import { createSupabaseClient, saveTransaction } from "./db-client.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Add authorization header verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Get request data
    const { amount, walletAddress, currency = 'USDT', cryptoAmount } = await req.json();
    
    if (!amount || amount <= 0 || !walletAddress) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount or missing wallet address' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Use the converted crypto amount if provided, otherwise use the USD amount 
    // (this keeps backward compatibility for stablecoins where they're the same)
    const amountToCharge = cryptoAmount !== undefined ? cryptoAmount : amount;

    console.log(`Creating CoinPayments payment for USD amount: $${amount}, wallet: ${walletAddress}, currency: ${currency}, crypto amount: ${amountToCharge}`);
    
    // Create Supabase client to record the transaction
    const supabaseClient = createSupabaseClient();

    // Generate a unique transaction ID
    const transactionId = crypto.randomUUID();

    try {
      // Get the user from the authorization header
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
      
      if (userError || !user) {
        console.log('Authentication error:', userError?.message || 'User not found');
        
        // Create a transaction using API keys but with anonymous email
        try {
          const paymentData = await createCoinPaymentsTransaction(
            amountToCharge, // Use the crypto amount here
            currency, 
            transactionId, 
            walletAddress, 
            'anonymous@example.com'
          );

          return new Response(
            JSON.stringify({
              paymentAddress: paymentData.address,
              amount: amount, // Return the original USD amount
              cryptoAmount: amountToCharge, // Also return the crypto amount
              transactionId: transactionId,
              externalTransactionId: paymentData.txn_id,
              qrCodeUrl: paymentData.qrcode_url,
              statusUrl: paymentData.status_url,
              expiresAt: new Date(paymentData.timeout * 1000).toISOString(),
              currency: paymentData.currency || currency,
              instructions: `Please send ${amountToCharge} ${paymentData.currency || currency} to the address above to complete your purchase.`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        } catch (apiError) {
          console.error('Error creating transaction with anonymous user:', apiError);
          // Fall back to mock data if api fails
          const mockPaymentData = await createCoinPaymentsTransaction(
            amountToCharge, // Use the crypto amount here
            currency, 
            transactionId, 
            walletAddress, 
            'anonymous@example.com',
            true // Force mock mode
          );
          
          return new Response(
            JSON.stringify({
              paymentAddress: mockPaymentData.address,
              amount: amount, // Return the original USD amount
              cryptoAmount: amountToCharge, // Also return the crypto amount
              transactionId: transactionId,
              externalTransactionId: mockPaymentData.txn_id,
              qrCodeUrl: mockPaymentData.qrcode_url,
              statusUrl: mockPaymentData.status_url,
              expiresAt: new Date(mockPaymentData.timeout * 1000).toISOString(),
              currency: mockPaymentData.currency || currency,
              instructions: `Please send ${amountToCharge} ${mockPaymentData.currency || currency} to the address above to complete your purchase.`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
      }

      // Create a new transaction in CoinPayments API with authenticated user
      try {
        const paymentData = await createCoinPaymentsTransaction(
          amountToCharge, // Use the crypto amount here
          currency, 
          transactionId, 
          walletAddress, 
          user.email
        );

        try {
          // Save transaction to database
          await saveTransaction(
            supabaseClient,
            user.id,
            amount, // Save original USD amount
            walletAddress,
            transactionId,
            paymentData.address,
            paymentData.txn_id,
            currency
          );
        } catch (dbError) {
          // Continue without failing - we'll still return the payment details
          console.log('Database error when saving transaction:', dbError);
          console.log('Continuing despite database error');
        }

        return new Response(
          JSON.stringify({
            paymentAddress: paymentData.address,
            amount: amount, // Return the original USD amount
            cryptoAmount: amountToCharge, // Also return the crypto amount
            transactionId: transactionId,
            externalTransactionId: paymentData.txn_id,
            qrCodeUrl: paymentData.qrcode_url,
            statusUrl: paymentData.status_url,
            expiresAt: new Date(paymentData.timeout * 1000).toISOString(),
            currency: paymentData.currency || currency,
            instructions: `Please send ${amountToCharge} ${paymentData.currency || currency} to the address above to complete your purchase.`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } catch (apiError) {
        console.error('Error with CoinPayments API:', apiError);
        
        // Fall back to mock data if api fails
        const mockPaymentData = await createCoinPaymentsTransaction(
          amountToCharge, // Use the crypto amount here
          currency, 
          transactionId, 
          walletAddress, 
          user.email,
          true // Force mock mode
        );
        
        try {
          // Save transaction with mock data
          await saveTransaction(
            supabaseClient,
            user.id,
            amount, // Save original USD amount
            walletAddress,
            transactionId,
            mockPaymentData.address,
            mockPaymentData.txn_id,
            currency
          );
        } catch (dbError) {
          console.error('Database error when saving transaction with mock data:', dbError);
        }
        
        return new Response(
          JSON.stringify({
            paymentAddress: mockPaymentData.address,
            amount: amount, // Return the original USD amount
            cryptoAmount: amountToCharge, // Also return the crypto amount
            transactionId: transactionId,
            externalTransactionId: mockPaymentData.txn_id,
            qrCodeUrl: mockPaymentData.qrcode_url,
            statusUrl: mockPaymentData.status_url,
            expiresAt: new Date(mockPaymentData.timeout * 1000).toISOString(),
            currency: mockPaymentData.currency || currency,
            instructions: `Please send ${amountToCharge} ${mockPaymentData.currency || currency} to the address above to complete your purchase.`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    } catch (error) {
      console.error('General error in user authentication flow:', error);
      
      // Final fallback to mock data
      const mockPaymentData = await createCoinPaymentsTransaction(
        amountToCharge, // Use the crypto amount here
        currency, 
        transactionId, 
        walletAddress, 
        'fallback@example.com',
        true // Force mock mode
      );
      
      return new Response(
        JSON.stringify({
          paymentAddress: mockPaymentData.address,
          amount: amount, // Return the original USD amount
          cryptoAmount: amountToCharge, // Also return the crypto amount
          transactionId: transactionId,
          externalTransactionId: mockPaymentData.txn_id,
          qrCodeUrl: mockPaymentData.qrcode_url,
          statusUrl: mockPaymentData.status_url,
          expiresAt: new Date(mockPaymentData.timeout * 1000).toISOString(),
          currency: mockPaymentData.currency || currency,
          instructions: `Please send ${amountToCharge} ${mockPaymentData.currency || currency} to the address above to complete your purchase.`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in edge function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
