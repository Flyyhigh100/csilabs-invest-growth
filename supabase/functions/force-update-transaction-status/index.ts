
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { transaction_id, external_transaction_id, force_status } = await req.json();
    console.log(`Force update request received:`, JSON.stringify({
      transaction_id,
      external_transaction_id,
      force_status
    }));

    // Validate input
    if ((!transaction_id && !external_transaction_id) || !force_status) {
      throw new Error("Missing required parameters. Need either transaction_id or external_transaction_id, and force_status");
    }

    // Validate status
    const allowedStatuses = ["pending", "confirmed", "completed", "failed"];
    if (!allowedStatuses.includes(force_status)) {
      throw new Error(`Invalid status. Allowed values are: ${allowedStatuses.join(", ")}`);
    }

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Authentication failed");
    }
    
    const { data: isAdmin, error: adminError } = await supabaseAdmin.rpc('is_admin');
    
    if (adminError || !isAdmin) {
      console.error("Admin check error:", adminError);
      throw new Error("Only administrators can perform this action");
    }

    // Build query to find transaction
    let query = supabaseAdmin.from("transactions").select("*");
    
    if (transaction_id) {
      query = query.eq("id", transaction_id);
    } else if (external_transaction_id) {
      query = query.eq("external_transaction_id", external_transaction_id);
    }
    
    // Find transaction
    const { data: transactions, error: txError } = await query;
    
    if (txError) {
      console.error("Error fetching transaction:", txError);
      throw new Error(`Failed to find transaction: ${txError.message}`);
    }
    
    if (!transactions || transactions.length === 0) {
      throw new Error("No matching transactions found");
    }

    console.log(`Found ${transactions.length} matching transactions`);

    // Update the transaction status
    const updateData = {
      status: force_status,
      updated_at: new Date().toISOString()
    };

    // If status is completed, set the completed_at timestamp
    if (force_status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }

    // Update all matched transactions
    const results = [];
    for (const tx of transactions) {
      console.log(`Updating transaction ${tx.id} status to ${force_status}`);
      
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("transactions")
        .update(updateData)
        .eq("id", tx.id)
        .select()
        .single();
        
      if (updateError) {
        console.error(`Error updating transaction ${tx.id}:`, updateError);
        results.push({
          transaction_id: tx.id,
          success: false,
          error: updateError.message
        });
      } else {
        console.log(`Successfully updated transaction ${tx.id}`);
        results.push({
          transaction_id: tx.id,
          success: true,
          transaction: updated
        });
        
        // Create notification for the user if status is completed
        if (force_status === "completed") {
          const { error: notifError } = await supabaseAdmin
            .from("notifications")
            .insert({
              user_id: tx.user_id,
              type: "admin_update",
              title: "Transaction Status Updated",
              message: `Your transaction has been manually marked as ${force_status} by an administrator.`
            });
            
          if (notifError) {
            console.error(`Error creating notification for user ${tx.user_id}:`, notifError);
          }
        }
      }
    }

    // Return response with results
    return new Response(
      JSON.stringify({
        success: results.every(r => r.success),
        message: `Updated ${results.filter(r => r.success).length} of ${transactions.length} transactions to status: ${force_status}`,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in force-update-transaction-status:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
