
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "./utils.ts";
import { createClients } from "./clients.ts";
import { handleAdminOperations } from "./handlers.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase clients
    const { authorization, supabase, adminClient } = await createClients(req);

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User authentication error:", userError);
      return new Response(
        JSON.stringify({ 
          error: "Unauthorized", 
          details: "Authentication required"
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`User authenticated: ${user.id}, email: ${user.email}`);

    // Special case for chris.d.conley@gmail.com - immediate admin access without DB check
    if (user.email && user.email.toLowerCase() === 'chris.d.conley@gmail.com') {
      console.log("Special admin user detected - bypassing admin check");
      
      // Parse the request body
      const { action, data } = await req.json();
      
      // Process admin operations with bypassed admin check
      const result = await handleAdminOperations(action, data, user, adminClient);
      
      return new Response(
        JSON.stringify(result),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if the user is an admin - with better error handling
    try {
      console.log("Checking admin status for user:", user.id);
      const { data: adminData, error: adminError } = await adminClient
        .from("admins")
        .select("*")
        .or(`id.eq.${user.id},email.eq.${user.email?.toLowerCase()}`)
        .maybeSingle();

      if (adminError) {
        console.error("Admin check query error:", adminError);
        return new Response(
          JSON.stringify({ 
            error: "Internal Server Error", 
            details: "Failed to verify admin permissions" 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!adminData) {
        console.error("Access denied: User is not an admin:", user.id);
        return new Response(
          JSON.stringify({ 
            error: "Forbidden", 
            details: "Admin access required"
          }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log("Admin access confirmed for user:", user.id);

      // Parse the request body
      const { action, data } = await req.json();

      // Process admin operations
      const result = await handleAdminOperations(action, data, user, adminClient);
      
      return new Response(
        JSON.stringify(result),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (checkError) {
      console.error("Error checking admin status:", checkError);
      return new Response(
        JSON.stringify({ error: "Internal Server Error", details: checkError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Admin operation error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error", details: error.stack }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
