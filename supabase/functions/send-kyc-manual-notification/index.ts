
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

// This function re-triggers email notification for KYC verifications
// It's called from the admin panel when an admin wants to manually
// resend notification emails that might have failed

interface ManualNotificationRequest {
  kycId: string;
  adminId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { kycId, adminId }: ManualNotificationRequest = await req.json();

    if (!kycId) {
      throw new Error('KYC ID is required');
    }

    console.log(`🔄 Manual KYC notification requested for KYC ${kycId} by admin ${adminId}`);

    // Create Supabase client with service role for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin permissions
    console.log(`👮 Verifying admin permissions for user ${adminId}`);
    const { data: adminData, error: adminError } = await supabaseClient
      .from('admins')
      .select('id')
      .eq('id', adminId)
      .single();

    if (adminError || !adminData) {
      console.error('❌ Permission denied: Not an admin', adminError);
      throw new Error('Permission denied: Admin access required');
    }

    // Fetch KYC verification data to get status and user ID
    const { data: kycData, error: kycError } = await supabaseClient
      .from('kyc_verifications')
      .select('id, user_id, status, rejection_reason, clarification_message')
      .eq('id', kycId)
      .single();

    if (kycError || !kycData) {
      console.error('Error fetching KYC data:', kycError);
      throw new Error('Failed to fetch KYC verification data');
    }

    console.log(`✅ Found KYC verification with status: ${kycData.status}`);

    // Call the send-kyc-notification-email function with the appropriate data
    console.log(`📧 Calling email notification function for KYC ${kycId}, status: ${kycData.status}`);
    
    const emailResult = await supabaseClient.functions.invoke('send-kyc-notification-email', {
      body: {
        userId: kycData.user_id,
        kycId: kycId,
        status: kycData.status,
        rejectionReason: kycData.rejection_reason || undefined,
        clarificationMessage: kycData.clarification_message || undefined
      }
    });
    
    if (emailResult.error) {
      console.error('Failed to send email notification:', emailResult.error);
      throw new Error(`Failed to send email: ${emailResult.error.message}`);
    }

    // Create an audit log entry
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: kycData.user_id,
        type: 'admin_audit',
        title: 'KYC Email Resent',
        message: `Admin ${adminId} manually resent KYC notification email for status: ${kycData.status}`,
        read: false
      });

    console.log(`✅ Successfully sent manual KYC notification for KYC ${kycId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        emailId: emailResult.data?.emailId,
        status: kycData.status,
        userId: kycData.user_id,
        kycId
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
    
  } catch (error: any) {
    console.error("Error in send-kyc-manual-notification function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: error.message.includes('Permission denied') ? 403 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
