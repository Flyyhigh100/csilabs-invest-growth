
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

// CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to create a success response
function createSuccessResponse(data: any) {
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Helper function to create an error response
function createErrorResponse(message: string, status = 400) {
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

    console.log(`Admin ${user.id} is marking all data as test data`);

    // Call the database function to mark all data as test
    const { data, error } = await supabase
      .rpc('mark_data_as_test');
    
    if (error) {
      console.error('Error marking data as test:', error);
      return createErrorResponse(`Failed to mark data as test: ${error.message}`, 500);
    }
    
    console.log('Mark data as test operation completed:', data);
    
    return createSuccessResponse({
      message: 'All data has been marked as test data successfully',
      details: data
    });
  } catch (error) {
    console.error('Unhandled exception in mark-data-as-test:', error);
    return createErrorResponse(`Internal server error: ${error.message}`, 500);
  }
});
