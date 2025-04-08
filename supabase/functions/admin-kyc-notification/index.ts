
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.3";
import { Resend } from "npm:resend@2.0.0";

// Initialize the Resend client for sending emails
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize Supabase client with admin privileges
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    const requestData = await req.json();
    const { user_id, kyc_id, submitted_at } = requestData;
    
    if (!user_id || !kyc_id) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Processing KYC notification for user ${user_id}, KYC ID: ${kyc_id}`);
    
    // Fetch the user profile data to include in the email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', user_id)
      .single();
      
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      throw new Error(`Failed to fetch user profile: ${profileError.message}`);
    }
    
    // Fetch all admin emails
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('email');
      
    if (adminsError) {
      console.error("Error fetching admin emails:", adminsError);
      throw new Error(`Failed to fetch admin emails: ${adminsError.message}`);
    }
    
    if (!admins || admins.length === 0) {
      console.warn("No admin emails found in the database");
      return new Response(
        JSON.stringify({ message: "No admin emails to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Extract admin emails
    const adminEmails = admins.map(admin => admin.email);
    
    // Format the submitted time
    const submittedTime = submitted_at 
      ? new Date(submitted_at).toLocaleString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })
      : 'Just now';
    
    // Create the admin notification email
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: 'KYC System <onboarding@resend.dev>',
      to: adminEmails,
      subject: 'New KYC Verification Submission',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h1 style="color: #334155;">New KYC Verification Submitted</h1>
          <p>A new KYC verification has been submitted and requires review.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h2 style="font-size: 18px; margin-top: 0;">User Details</h2>
            <p><strong>Name:</strong> ${profile.first_name} ${profile.last_name}</p>
            <p><strong>Email:</strong> ${profile.email}</p>
            <p><strong>User ID:</strong> ${user_id}</p>
            <p><strong>KYC ID:</strong> ${kyc_id}</p>
            <p><strong>Submitted:</strong> ${submittedTime}</p>
          </div>
          
          <p>Please review this verification at your earliest convenience.</p>
          <a href="${supabaseUrl.replace('.supabase.co', '.supabase.co/dashboard')}/project/hrhvliqkmetcdphnetxb/auth/users/${user_id}" 
             style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
            View User in Dashboard
          </a>
          <div style="margin-top: 30px; font-size: 12px; color: #64748b;">
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      `,
    });
    
    if (emailError) {
      console.error("Error sending email notification:", emailError);
      throw new Error(`Failed to send email notification: ${emailError.message}`);
    }
    
    console.log("Admin notification email sent successfully:", emailResult);
    
    // Create a notification for each admin in the notifications table
    for (const admin of admins) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: admin.id, // Assuming admin.id exists
          title: 'New KYC Verification Submitted',
          message: `User ${profile.first_name} ${profile.last_name} has submitted a KYC verification.`,
          type: 'kyc',
          read: false
        });
        
      if (notifError) {
        console.error(`Error creating notification for admin ${admin.email}:`, notifError);
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Admin notification sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in admin-kyc-notification function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
