
// Force redeployment by adding a timestamp comment
// Last updated: 2025-06-05T15:30:00Z

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';
import { handleAdminOperations } from './handlers.ts';
import { AdminOperationsSecurity } from './security.ts';

console.log("🚀 Admin Operations Edge Function Starting (Enhanced Auth Fix)...");

serve(async (req) => {
  console.log("=== SECURE ADMIN OPERATIONS REQUEST START ===");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for authorization header with better error handling
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error("❌ No valid authorization header found");
      return new Response(
        JSON.stringify({ 
          error: 'No authorization header',
          details: 'Bearer token required'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log("✅ Authorization header found");

    // Parse and validate request body
    let rawBody;
    try {
      rawBody = await req.json();
      console.log("📝 Raw request received successfully");
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const { operation, data } = AdminOperationsSecurity.validateAndSanitizeInput(rawBody);
    
    if (!operation) {
      console.error("❌ No operation specified");
      return new Response(
        JSON.stringify({ error: 'No operation specified' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log("🎯 Operation identified:", operation);

    // Create Supabase clients with enhanced error handling
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing required environment variables");
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log("🔐 Creating Supabase clients...");
    
    // Create user-context client for auth verification
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    // Create admin client with service role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Enhanced user verification with better error handling
    console.log("🔍 Verifying user authentication...");
    const token = authHeader.replace('Bearer ', '');
    
    let user;
    try {
      const { data: { user: userData }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError) {
        console.error("❌ User verification failed:", userError);
        
        // Return more specific error based on the type
        if (userError.message?.includes('session_not_found') || userError.message?.includes('invalid_token')) {
          return new Response(
            JSON.stringify({ 
              error: 'Authentication session expired',
              details: 'Please log in again'
            }),
            { 
              status: 401, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } else {
          return new Response(
            JSON.stringify({ 
              error: 'Invalid authentication token',
              details: userError.message
            }),
            { 
              status: 401, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }
      
      if (!userData) {
        console.error("❌ No user data returned");
        return new Response(
          JSON.stringify({ 
            error: 'Authentication failed',
            details: 'User not found'
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      user = userData;
      console.log(`✅ User authenticated: ${user.id} (${user.email})`);
    } catch (authException) {
      console.error("💥 Exception during user verification:", authException);
      return new Response(
        JSON.stringify({ 
          error: 'Authentication service error',
          details: 'Unable to verify user credentials'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Security validation (rate limiting, etc.)
    const securityCheck = await AdminOperationsSecurity.validateRequest(req, user);
    if (!securityCheck.isValid) {
      console.error("❌ Security validation failed:", securityCheck.error);
      return new Response(
        JSON.stringify({ error: securityCheck.error }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Enhanced admin verification with better error handling
    console.log("🔍 Checking admin status...");
    
    let adminRecord;
    try {
      const { data: adminData, error: adminError } = await adminClient
        .from('admins')
        .select('id, email, role')
        .or(`id.eq.${user.id},email.ilike.${user.email}`)
        .maybeSingle();

      if (adminError) {
        console.error("❌ Error checking admin status:", adminError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to verify admin permissions',
            details: adminError.message
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      adminRecord = adminData;
    } catch (adminException) {
      console.error("💥 Exception checking admin status:", adminException);
      return new Response(
        JSON.stringify({ 
          error: 'Admin verification service error',
          details: 'Unable to verify admin status'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!adminRecord) {
      console.error(`❌ User ${user.id} (${user.email}) is not an admin`);
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized: Admin access required',
          details: 'This operation requires admin privileges'
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`✅ Admin user ${user.id} (${user.email}) authorized for operation: ${operation}`);

    // Log the operation for audit purposes
    await AdminOperationsSecurity.logOperation(
      adminClient, 
      operation, 
      user, 
      data, 
      securityCheck.clientInfo
    );

    // Route to appropriate handler with enhanced error handling
    console.log(`🎯 Routing operation ${operation} to handleAdminOperations`);
    
    let result;
    try {
      result = await handleAdminOperations(operation, data, user, adminClient);
      console.log(`✅ Operation ${operation} completed successfully`);
    } catch (handlerError) {
      console.error(`💥 Handler error for ${operation}:`, handlerError);
      return new Response(
        JSON.stringify({ 
          error: 'Operation failed',
          details: handlerError.message || 'Unknown error during operation'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Return result
    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error("💥 Unhandled error in admin operations:", error);
    const sanitizedError = AdminOperationsSecurity.handleError(error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: sanitizedError
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
