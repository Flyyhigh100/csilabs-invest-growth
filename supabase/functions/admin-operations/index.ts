
// Force redeployment by adding a timestamp comment
// Last updated: 2025-06-04T10:21:00Z

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';
import { handleAdminOperations } from './handlers.ts';

console.log("🚀 Admin Operations Edge Function Starting...");

serve(async (req) => {
  console.log("=== ADMIN OPERATIONS REQUEST START ===");
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

    // Parse request body
    const body = await req.json();
    console.log("📝 Request body parsed:", JSON.stringify(body, null, 2));
    
    const { operation, data } = body;
    
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

    // Check if user is admin
    const { data: adminData, error: adminError } = await adminClient
      .from('admins')
      .select('*')
      .or(`id.eq.${user.id},email.eq.${user.email}`)
      .single();

    if (adminError || !adminData) {
      console.error("❌ User is not an admin:", adminError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`✅ Admin user ${user.id} authorized for operation: ${operation}`);

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
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
