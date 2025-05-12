
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.10.0";

// Create a function to notify all admins
async function notifyAllAdmins(
  supabase: any, 
  title: string, 
  message: string, 
  type: string,
  data?: any
) {
  try {
    // Fetch all admin IDs
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('id');
    
    if (adminsError) {
      throw adminsError;
    }
    
    if (!admins || admins.length === 0) {
      console.log('No admins found to notify');
      return;
    }
    
    // Create notification for each admin
    const notifications = admins.map(admin => ({
      user_id: admin.id,
      title,
      message,
      type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      read: false,
      metadata: data || {}
    }));
    
    const { data: result, error: insertError } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();
    
    if (insertError) {
      throw insertError;
    }
    
    return { success: true, notified: admins.length, notifications: result };
  } catch (error) {
    console.error("Error notifying admins:", error);
    return { success: false, error: error.message };
  }
}

// Set up Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  try {
    // CORS headers
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    
    // Handle OPTIONS request for CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { headers, status: 204 });
    }
    
    // Parse request body
    const body = await req.json();
    const { event, data } = body;
    
    if (!event) {
      return new Response(
        JSON.stringify({ error: "Missing event parameter" }), 
        { headers, status: 400 }
      );
    }
    
    let result;
    
    // Handle different notification events
    switch (event) {
      case "kyc_submitted":
        // KYC verification submitted
        if (!data?.user_id || !data?.kyc_id) {
          return new Response(
            JSON.stringify({ error: "Missing required KYC data" }),
            { headers, status: 400 }
          );
        }
        
        // Get user profile info
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("first_name, last_name, email")
          .eq("id", data.user_id)
          .single();
          
        const userName = userProfile ? 
          `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 
          userProfile.email || 
          "A user" : "A user";
        
        result = await notifyAllAdmins(
          supabase,
          "KYC Verification Submitted",
          `${userName} has submitted a KYC verification that needs review.`,
          "kyc",
          { kyc_id: data.kyc_id, user_id: data.user_id }
        );
        break;
        
      case "transaction_completed":
        // Transaction completed, needs token distribution
        if (!data?.transaction_id || !data?.user_id) {
          return new Response(
            JSON.stringify({ error: "Missing required transaction data" }),
            { headers, status: 400 }
          );
        }
        
        result = await notifyAllAdmins(
          supabase,
          "Token Distribution Required",
          `A transaction has completed and requires manual token distribution.`,
          "tokens",
          { transaction_id: data.transaction_id, user_id: data.user_id }
        );
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: "Unknown event type" }), 
          { headers, status: 400 }
        );
    }
    
    return new Response(
      JSON.stringify(result), 
      { headers, status: result.success ? 200 : 500 }
    );
  } catch (error) {
    console.error("Error in admin-notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
