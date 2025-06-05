
// Force redeployment by adding a timestamp comment
// Last updated: 2025-06-04T14:30:00Z

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';
import { handleAdminOperations } from './handlers.ts';
import { AdminOperationsSecurity } from './security.ts';

console.log("🚀 Admin Operations Edge Function Starting (Hardened - Fixed Admin Auth)...");

serve(async (req) => {
  console.log("=== SECURE ADMIN OPERATIONS REQUEST START ===");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("❌ No authorization header found");
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log("✅ Authorization header found");

    // Parse and validate request body
    const rawBody = await req.json();
    console.log("📝 Raw request received");
    
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

    // Create Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    console.log("🔐 Supabase client created, verifying user...");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create admin client with service role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("❌ Invalid user token:", userError);
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`✅ User authenticated: ${user.id} (${user.email})`);

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

    // FIXED: Direct admin verification using database query instead of RPC
    console.log("🔍 Checking admin status directly from database...");
    
    const { data: adminRecord, error: adminError } = await adminClient
      .from('admins')
      .select('id, email, role')
      .or(`id.eq.${user.id},email.ilike.${user.email}`)
      .maybeSingle();

    if (adminError) {
      console.error("❌ Error checking admin status:", adminError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify admin permissions' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!adminRecord) {
      console.error(`❌ User ${user.id} (${user.email}) is not an admin`);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
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

    // Route to appropriate handler
    console.log(`🎯 Routing operation ${operation} to handleAdminOperations`);
    const result = await handleAdminOperations(operation, data, user, adminClient);

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
