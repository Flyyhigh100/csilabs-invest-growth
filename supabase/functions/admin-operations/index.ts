
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
