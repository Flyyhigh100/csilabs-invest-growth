
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface MagicLinkRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('=== SEND MAGIC LINK START ===');
  console.log('🔧 PURE SUPABASE - Using native magic link flow');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request origin:', req.headers.get('origin'));
  console.log('Timestamp:', new Date().toISOString());

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.text();
    console.log('Raw request body:', requestBody);
    
    const { email }: MagicLinkRequest = JSON.parse(requestBody);
    
    if (!email) {
      console.error('No email provided in request');
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎯 Processing pure Supabase magic link for email:', email);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Use the production domain for direct redirect to dashboard
    const productionUrl = 'https://1millionstrongfightclub.com';
    const redirectUrl = `${productionUrl}/dashboard/payments`;
    
    console.log('🔗 Using direct redirect URL:', redirectUrl);
    console.log('🏠 Production base URL:', productionUrl);

    // Send magic link using Supabase's native signInWithOtp
    console.log('🔐 Sending Supabase native magic link...');
    const { data: linkData, error: linkError } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: redirectUrl,
        shouldCreateUser: true
      }
    });

    if (linkError) {
      console.error('❌ Error sending magic link:', linkError);
      throw new Error('Failed to send magic link: ' + linkError.message);
    }

    console.log('✅ Magic link sent successfully via Supabase native flow');
    console.log('📧 Response data:', linkData);

    // Send custom email with enhanced branding
    console.log('📬 Sending branded email via Resend...');
    const emailResponse = await resend.emails.send({
      from: "1 Million Strong Fight Club <team@mail.1millionstrongfightclub.com>",
      to: [email],
      subject: "🔐 Sign in to 1 Million Strong Fight Club",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sign in to 1 Million Strong Fight Club</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${productionUrl}/Newlogo.jpg" alt="1 Million Strong Fight Club" style="height: 60px; width: auto;">
            </div>
            
            <h1 style="color: #1e40af; text-align: center; margin-bottom: 30px;">🔐 Sign in to 1 Million Strong Fight Club</h1>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hello! You requested to sign in to your 1 Million Strong Fight Club account. 
              <strong>Check your email for the magic link we just sent you.</strong>
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
              <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #1e40af;">
                📧 Magic Link Sent!
              </p>
              <p style="margin: 0; font-size: 14px; color: #666;">
                Look for an email from Supabase with the subject line containing "Confirm your signup" or "Magic Link".
                Click the link in that email to securely access your dashboard.
              </p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>📧 Email Issues?</strong> 
                Hotmail/Outlook users should check their spam/junk folder. 
                Gmail users should check the Promotions tab.
              </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>🔍 Debug Info (Native Flow):</strong><br>
                Generated at: ${new Date().toISOString()}<br>
                Redirect target: ${redirectUrl}<br>
                Link type: Supabase Native Magic Link<br>
                Flow: Pure Supabase Authentication
              </p>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
              <p><strong>⏰ Important:</strong> This link will expire in 1 hour for security reasons.</p>
              <p><strong>🛡️ Security:</strong> If you didn't request this email, you can safely ignore it.</p>
              <p><strong>📱 Mobile Users:</strong> The magic link will work best if opened in the same browser where you requested it.</p>
              <p style="text-align: center; margin-top: 20px;">
                <strong>1 Million Strong Fight Club</strong> - Building Community Strength
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('📧 Email sending result:', {
      success: !!emailResponse.data,
      emailId: emailResponse.data?.id,
      error: emailResponse.error?.message
    });

    if (emailResponse.error) {
      console.error('❌ Failed to send email:', emailResponse.error);
      // Don't throw here - the magic link was still sent by Supabase
    }

    console.log('✅ Magic link process completed successfully:', {
      emailId: emailResponse.data?.id,
      recipientEmail: email,
      redirectTarget: redirectUrl,
      timestamp: new Date().toISOString(),
      flow: 'native-supabase'
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Magic link sent to your email',
        debug: {
          emailId: emailResponse.data?.id,
          linkSent: true,
          redirectUrl: redirectUrl,
          timestamp: new Date().toISOString(),
          environment: 'production',
          flow: 'native-supabase'
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('💥 Error in send-magic-link function:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send magic link',
        details: error.stack,
        timestamp: new Date().toISOString(),
        environment: 'production',
        flow: 'native-supabase'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);
