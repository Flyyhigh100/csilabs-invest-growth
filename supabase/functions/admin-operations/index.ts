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
        return await handleUpdateCoinPaymentsConfig(supabase, requestBody);
        
      default:
        return createErrorResponse(`Unknown operation: ${operation}`, 400);
    }

  } catch (error) {
    console.error('Unhandled exception in admin-operations:', error);
    return createErrorResponse(`Internal server error: ${error.message}`, 500);
  }
});

/**
 * Update CoinPayments configuration secrets
 */
async function handleUpdateCoinPaymentsConfig(supabase, requestBody) {
  try {
    const { public_key, private_key, ipn_secret, merchant_id } = requestBody;
    
    if (!public_key || !private_key) {
      return createErrorResponse('Missing required API keys', 400);
    }
    
    // Update each secret individually to avoid issues if some are missing
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
    
    // Wait for all updates to complete
    await Promise.all(updates);
    
    return createSuccessResponse({
      message: 'CoinPayments configuration updated successfully',
      updated: {
        public_key: !!public_key,
        private_key: !!private_key,
        ipn_secret: !!ipn_secret,
        merchant_id: !!merchant_id
      }
    });
  } catch (error) {
    console.error('Error updating CoinPayments configuration:', error);
    return createErrorResponse(`Failed to update configuration: ${error.message}`, 500);
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
