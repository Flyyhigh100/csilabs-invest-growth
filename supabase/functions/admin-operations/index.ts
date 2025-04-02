
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
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if the user is an admin
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("*")
      .eq("id", user.id)
      .single();

    if (adminError || !adminData) {
      // Perform a secondary check using email
      const { data: adminByEmailData, error: adminByEmailError } = await supabase
        .from("admins")
        .select("*")
        .eq("email", user.email)
        .single();

      if (adminByEmailError || !adminByEmailData) {
        console.error("Admin check failed:", adminError || adminByEmailError);
        return new Response(
          JSON.stringify({ 
            error: "Forbidden - Admin access required",
            details: "User is not registered as an admin" 
          }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

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
  } catch (error) {
    console.error("Admin operation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
