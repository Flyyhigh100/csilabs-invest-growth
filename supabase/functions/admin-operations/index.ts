
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

// CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to create a success response
function createSuccessResponse(data) {
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Helper function to create an error response
function createErrorResponse(message, status = 400) {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createErrorResponse('No authorization header', 401);
    }

    // Parse request body
    const requestBody = await req.json();
    const { operation } = requestBody;

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify that the user is an admin
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (userError || !user) {
      return createErrorResponse('Invalid auth token', 401);
    }
    
    // Check if user is an admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    if (adminError || !adminData) {
      return createErrorResponse('Unauthorized: Admin access required', 403);
    }

    // Handle different operations
    switch (operation) {
      case 'update_coinpayments_config':
        return await handleUpdateCoinPaymentsConfig(supabase, requestBody, user.id);

      case 'processKyc':
        return await handleProcessKyc(supabase, requestBody, user.id);
        
      case 'requestKycClarification':
        return await handleRequestKycClarification(supabase, requestBody, user.id);
        
      default:
        return createErrorResponse(`Unknown operation: ${operation}`, 400);
    }

  } catch (error) {
    console.error('Unhandled exception in admin-operations:', error);
    return createErrorResponse(`Internal server error: ${error.message}`, 500);
  }
});

/**
 * Update CoinPayments configuration secrets in both the database and edge function secrets
 */
async function handleUpdateCoinPaymentsConfig(supabase, requestBody, adminUserId) {
  try {
    const { public_key, private_key, ipn_secret, merchant_id } = requestBody;
    
    if (!public_key || !private_key) {
      return createErrorResponse('Missing required API keys', 400);
    }
    
    console.log(`Admin ${adminUserId} is updating CoinPayments configuration`);
    
    // Update each secret individually in the database secrets table
    const updates = [];
    
    if (public_key) {
      updates.push(updateSecret(supabase, 'COINPAYMENTS_PUBLIC_KEY', public_key));
    }
    
    if (private_key) {
      updates.push(updateSecret(supabase, 'COINPAYMENTS_PRIVATE_KEY', private_key));
    }
    
    if (ipn_secret) {
      updates.push(updateSecret(supabase, 'COINPAYMENTS_IPN_SECRET', ipn_secret));
    }
    
    if (merchant_id) {
      updates.push(updateSecret(supabase, 'COINPAYMENTS_MERCHANT_ID', merchant_id));
    }
    
    // Wait for all database updates to complete
    await Promise.all(updates);
    
    // Now update the edge function secrets by making requests to the Supabase Management API
    const projectRef = Deno.env.get('SUPABASE_PROJECT_REF') || 'hrhvliqkmetcdphnetxb';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Only attempt to update edge function secrets if we have the necessary credentials
    if (projectRef && serviceRoleKey) {
      try {
        // Create a client for the Supabase Management API
        const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/secrets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`
          },
          body: JSON.stringify([
            { name: 'COINPAYMENTS_PUBLIC_KEY', value: public_key },
            { name: 'COINPAYMENTS_PRIVATE_KEY', value: private_key },
            ...(ipn_secret ? [{ name: 'COINPAYMENTS_IPN_SECRET', value: ipn_secret }] : []),
            ...(merchant_id ? [{ name: 'COINPAYMENTS_MERCHANT_ID', value: merchant_id }] : [])
          ])
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error updating edge function secrets:', errorData);
          
          // Continue despite error - we'll report it in the response
          return createSuccessResponse({
            message: 'CoinPayments configuration partially updated',
            updated: {
              database: true,
              edgeFunctions: false
            },
            error: `Failed to update edge function secrets: ${response.status} ${response.statusText}`,
            details: "The database secrets were updated successfully, but the edge function secrets could not be updated. Please update them manually in the Supabase dashboard."
          });
        }
        
        console.log('Edge function secrets updated successfully');
      } catch (error) {
        console.error('Error updating edge function secrets:', error);
        
        // Continue despite error - we'll report it in the response
        return createSuccessResponse({
          message: 'CoinPayments configuration partially updated',
          updated: {
            database: true,
            edgeFunctions: false
          },
          error: `Exception updating edge function secrets: ${error.message}`,
          details: "The database secrets were updated successfully, but the edge function secrets could not be updated. Please update them manually in the Supabase dashboard."
        });
      }
    } else {
      console.warn('Missing required credentials to update edge function secrets');
      
      // Log available environment variables for debugging (without revealing values)
      console.log('Available environment variables:', Object.keys(Deno.env.toObject()).join(', '));
      
      // Continue despite missing credentials - we'll report it in the response
      return createSuccessResponse({
        message: 'CoinPayments configuration partially updated',
        updated: {
          database: true,
          edgeFunctions: false
        },
        details: "The database secrets were updated successfully, but the edge function secrets could not be updated due to missing credentials. Please update them manually in the Supabase dashboard."
      });
    }
    
    // Return success response with transaction data
    return createSuccessResponse({
      message: 'CoinPayments configuration updated successfully',
      updated: {
        database: true,
        edgeFunctions: true
      }
    });
  } catch (error) {
    console.error('Error updating CoinPayments configuration:', error);
    return createErrorResponse(`Failed to update configuration: ${error.message}`, 500);
  }
}

/**
 * Process a KYC verification (approve or reject)
 */
async function handleProcessKyc(supabase, requestBody, adminUserId) {
  try {
    const { kycId, status, rejectionReason } = requestBody.data;
    
    if (!kycId) {
      return createErrorResponse('Missing KYC ID', 400);
    }
    
    if (!['approved', 'rejected'].includes(status)) {
      return createErrorResponse('Invalid status. Must be "approved" or "rejected"', 400);
    }
    
    // If status is 'rejected', require a rejection reason
    if (status === 'rejected' && (!rejectionReason || rejectionReason.trim() === '')) {
      return createErrorResponse('Rejection reason is required', 400);
    }
    
    console.log(`Admin ${adminUserId} is processing KYC ${kycId} with status: ${status}`);
    
    // Prepare the update data based on status
    const updateData = {
      status: status,
      reviewed_at: new Date().toISOString(),
      approved_by: adminUserId,
    };
    
    // Add rejection reason if status is 'rejected'
    if (status === 'rejected') {
      updateData.rejection_reason = rejectionReason;
    }
    
    // If status is 'approved', set approved_at
    if (status === 'approved') {
      updateData.approved_at = new Date().toISOString();
    }
    
    // Update the KYC verification in the database
    const { data, error } = await supabase
      .from('kyc_verifications')
      .update(updateData)
      .eq('id', kycId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating KYC verification:', error);
      return createErrorResponse(`Failed to update KYC verification: ${error.message}`, 500);
    }
    
    // If KYC was approved, check if there are any pending transactions that need updating
    if (status === 'approved') {
      try {
        // This is a background task, we don't need to wait for it
        updatePendingTransactions(supabase, data.user_id);
      } catch (error) {
        console.error('Error updating pending transactions:', error);
        // Don't fail the main operation if this background task fails
      }
    }
    
    // Create notification for the user
    try {
      const notificationTitle = status === 'approved' 
        ? 'KYC Verification Approved' 
        : 'KYC Verification Rejected';
        
      const notificationMessage = status === 'approved'
        ? 'Your identity verification has been approved. You can now make purchases.'
        : `Your identity verification was rejected. Reason: ${rejectionReason}`;
        
      await supabase.from('notifications').insert({
        user_id: data.user_id,
        title: notificationTitle,
        message: notificationMessage,
        type: 'kyc',
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      // Don't fail the main operation if notification creation fails
    }
    
    // Return success response with updated KYC data
    return createSuccessResponse({
      message: `KYC verification ${status} successfully`,
      kyc: data
    });
  } catch (error) {
    console.error('Error processing KYC verification:', error);
    return createErrorResponse(`Failed to process KYC verification: ${error.message}`, 500);
  }
}

/**
 * Request clarification for a KYC verification
 */
async function handleRequestKycClarification(supabase, requestBody, adminUserId) {
  try {
    const { kycId, message } = requestBody.data;
    
    if (!kycId) {
      return createErrorResponse('Missing KYC ID', 400);
    }
    
    if (!message || message.trim() === '') {
      return createErrorResponse('Clarification message is required', 400);
    }
    
    console.log(`Admin ${adminUserId} is requesting clarification for KYC ${kycId}`);
    
    // Get the current KYC verification to check if it exists
    const { data: existingKyc, error: fetchError } = await supabase
      .from('kyc_verifications')
      .select('user_id')
      .eq('id', kycId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching KYC verification:', fetchError);
      return createErrorResponse(`KYC verification not found: ${fetchError.message}`, 404);
    }
    
    // Update the KYC verification in the database
    const updateData = {
      status: 'needs_clarification',
      reviewed_at: new Date().toISOString(),
      clarification_message: message,
    };
    
    const { data, error } = await supabase
      .from('kyc_verifications')
      .update(updateData)
      .eq('id', kycId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating KYC verification for clarification:', error);
      return createErrorResponse(`Failed to update KYC verification: ${error.message}`, 500);
    }
    
    // Create notification for the user
    try {
      await supabase.from('notifications').insert({
        user_id: existingKyc.user_id,
        title: 'KYC Verification Needs Clarification',
        message: `Your identity verification requires more information: ${message}`,
        type: 'kyc',
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      // Don't fail the main operation if notification creation fails
    }
    
    // Return success response with updated KYC data
    return createSuccessResponse({
      message: 'Clarification request sent successfully',
      kyc: data
    });
  } catch (error) {
    console.error('Error requesting KYC clarification:', error);
    return createErrorResponse(`Failed to request clarification: ${error.message}`, 500);
  }
}

/**
 * Helper function to update pending transactions after KYC approval
 */
async function updatePendingTransactions(supabase, userId) {
  try {
    // Find high-value transactions that needed KYC approval
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('high_value_approval_required', true)
      .eq('approval_status', 'pending')
      .select();
    
    if (error) {
      console.error('Error fetching pending transactions:', error);
      return;
    }
    
    if (!transactions || transactions.length === 0) {
      console.log('No pending transactions found for user:', userId);
      return;
    }
    
    console.log(`Found ${transactions.length} pending transactions to update for user ${userId}`);
    
    // Update each transaction
    for (const transaction of transactions) {
      await supabase
        .from('transactions')
        .update({
          approval_status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);
    }
    
    console.log(`Updated ${transactions.length} transactions to approved status`);
  } catch (error) {
    console.error('Error in background transaction update task:', error);
  }
}

/**
 * Helper function to update a secret in the database
 */
async function updateSecret(supabase, name, value) {
  // First check if the secret exists
  const { data: existingSecret } = await supabase
    .from('secrets')
    .select('id')
    .eq('name', name)
    .maybeSingle();
  
  if (existingSecret) {
    // Update existing secret
    return supabase
      .from('secrets')
      .update({ value })
      .eq('name', name);
  } else {
    // Create new secret
    return supabase
      .from('secrets')
      .insert({ name, value });
  }
}
