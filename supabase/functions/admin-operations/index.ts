
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the auth context of the logged in user
    const authorization = req.headers.get("Authorization") || "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authorization },
        },
      }
    );

    // Also create a special admin client using service role key for operations that need to bypass RLS
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

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

    // Process different admin actions
    let result;
    switch (action) {
      case "getUserDetails":
        const { userId } = data;
        const { data: userData, error: getUserError } = await adminClient.auth.admin.getUserById(userId);
        
        if (getUserError) {
          throw getUserError;
        }
        
        result = { user: userData };
        break;

      case "processKyc":
        const { kycId, status, rejectionReason } = data;
        
        console.log(`Admin ${user.id} processing KYC ${kycId} with status ${status}`);
        
        const updateData: any = {
          status,
          reviewed_at: new Date().toISOString(),
        };
        
        if (status === "approved") {
          updateData.approved_at = new Date().toISOString();
          updateData.approved_by = user.id;
          updateData.rejection_reason = null;
          updateData.clarification_message = null;
        } else if (status === "rejected" && rejectionReason) {
          updateData.rejection_reason = rejectionReason;
          updateData.approved_at = null;
          updateData.approved_by = null;
        }
        
        // Log the operation and data for debugging
        console.log("Admin processing KYC verification with update data:", updateData);
        
        // Use the admin client to bypass RLS
        const { data: kycData, error: kycError } = await adminClient
          .from("kyc_verifications")
          .update(updateData)
          .eq("id", kycId)
          .select()
          .single();
        
        if (kycError) {
          console.error("KYC update error:", kycError);
          throw kycError;
        }
        
        console.log("KYC update successful, returned data:", kycData);
        result = { kyc: kycData };
        break;

      case "requestKycClarification":
        const { kycId: clarifyKycId, message } = data;
        
        // Use the admin client to bypass RLS
        const { data: clarifyData, error: clarifyError } = await adminClient
          .from("kyc_verifications")
          .update({
            status: "needs_clarification",
            clarification_message: message,
            reviewed_at: new Date().toISOString(),
            approved_at: null,
            approved_by: null
          })
          .eq("id", clarifyKycId)
          .select()
          .single();
        
        if (clarifyError) {
          console.error("KYC clarification update error:", clarifyError);
          throw clarifyError;
        }
        
        console.log("KYC clarification update successful:", clarifyData);
        result = { kyc: clarifyData };
        break;

      case "markTokensSent":
        const { transactionId } = data;
        
        // Use the admin client to bypass RLS
        const { data: txData, error: txError } = await adminClient
          .from("transactions")
          .update({
            token_sent: true,
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", transactionId)
          .select()
          .single();
        
        if (txError) {
          throw txError;
        }
        
        result = { transaction: txData };
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

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
