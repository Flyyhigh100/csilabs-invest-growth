
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TransactionAlertPayload {
  transactionId: string;
  amount: number;
  walletAddress: string;
  paymentMethod: string;
  status: string;
  email?: string;
  name?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: TransactionAlertPayload = await req.json();
    const { transactionId, amount, walletAddress, paymentMethod, status } = payload;
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get CEO email from environment variable
    const ceoEmail = Deno.env.get('CEO_EMAIL');
    if (!ceoEmail) {
      console.error('CEO_EMAIL environment variable not set');
      throw new Error('CEO email not configured');
    }

    // Simple email sending using Supabase's built-in email service
    // This is a simple implementation. In production, you might want to use a dedicated email service like SendGrid, Mailgun or Resend
    const { error: emailError } = await supabaseClient.auth.admin.sendEmail(
      ceoEmail,
      {
        subject: `New ${paymentMethod.toUpperCase()} Transaction: $${amount}`,
        html: `
          <h2>New Transaction Alert</h2>
          <p>A new transaction has been recorded in the system and requires your attention.</p>
          <table style="border-collapse: collapse; width: 100%;">
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Transaction ID</th>
              <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${transactionId}</td>
            </tr>
            <tr>
              <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Amount</th>
              <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">$${amount}</td>
            </tr>
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Payment Method</th>
              <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${paymentMethod}</td>
            </tr>
            <tr>
              <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Wallet Address</th>
              <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${walletAddress}</td>
            </tr>
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Status</th>
              <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${status}</td>
            </tr>
          </table>
          <p style="margin-top: 20px;">Please log in to the admin portal to distribute the tokens.</p>
          <p><a href="${Deno.env.get('SITE_URL') ?? ''}/admin/transactions" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Go to Admin Portal</a></p>
        `
      },
      {
        type: "signup"
      }
    );

    if (emailError) {
      console.error('Error sending email alert:', emailError);
      throw emailError;
    }

    console.log(`Alert email sent to CEO for transaction ${transactionId}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Alert sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in transaction alert function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
