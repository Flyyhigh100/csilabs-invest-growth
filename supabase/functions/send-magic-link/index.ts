
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
  console.log('🔧 DEBUGGING MODE - Enhanced logging for production site');
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

    console.log('🎯 Processing magic link request for email:', email);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Use the production domain consistently
    const productionUrl = 'https://1millionstrongfightclub.com';
    const redirectUrl = `${productionUrl}/auth/magic-link`;
    
    console.log('🔗 Using redirect URL:', redirectUrl);
    console.log('🏠 Production base URL:', productionUrl);

    // Generate magic link using Supabase's native method
    console.log('🔐 Generating Supabase magic link...');
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: redirectUrl
      }
    });

    if (linkError) {
      console.error('❌ Error generating magic link:', linkError);
      throw new Error('Failed to generate magic link: ' + linkError.message);
    }

    if (!linkData || !linkData.properties) {
      console.error('❌ No link data returned from generateLink');
      throw new Error('Failed to generate magic link - no data returned');
    }

    console.log('✅ Magic link generated successfully');
    console.log('📧 Link data structure:', {
      hasProperties: !!linkData.properties,
      hasActionLink: !!linkData.properties.action_link,
      hasUser: !!linkData.user,
      userEmail: linkData.user?.email
    });

    const actionLink = linkData.properties.action_link;
    console.log('🔗 Action link created:', actionLink.substring(0, 100) + '...');
    
    // Parse the action link to understand its structure
    const actionUrl = new URL(actionLink);
    console.log('🔍 Action link analysis:', {
      hostname: actionUrl.hostname,
      pathname: actionUrl.pathname,
      hasToken: actionUrl.searchParams.has('token'),
      hasType: actionUrl.searchParams.has('type'),
      hasRedirectTo: actionUrl.searchParams.has('redirect_to'),
      redirectToValue: actionUrl.searchParams.get('redirect_to'),
      allParams: Object.fromEntries(actionUrl.searchParams.entries())
    });

    // Send email with enhanced debugging
    console.log('📬 Sending email via Resend...');
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
              Hello! You requested to sign in to your 1 Million Strong Fight Club account. Click the button below to securely access your dashboard:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${actionLink}" 
                 style="background: linear-gradient(to right, #1e40af, #0891b2); 
                        color: white; 
                        padding: 15px 35px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                🚀 Sign In Now
              </a>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>🔍 Debug Info (Production):</strong><br>
                Generated at: ${new Date().toISOString()}<br>
                Redirect target: ${redirectUrl}<br>
                Link type: Supabase Magic Link
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; word-break: break-all; background: #f5f5f5; padding: 15px; border-radius: 4px; border: 1px solid #ddd;">
              ${actionLink}
            </p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
              <p><strong>⏰ Important:</strong> This link will expire in 1 hour for security reasons.</p>
              <p><strong>🛡️ Security:</strong> If you didn't request this email, you can safely ignore it.</p>
              <p><strong>📧 Email Issues?</strong> Hotmail/Outlook users should check their spam/junk folder.</p>
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
      throw new Error('Failed to send email: ' + emailResponse.error.message);
    }

    console.log('✅ Magic link email sent successfully:', {
      emailId: emailResponse.data?.id,
      recipientEmail: email,
      actionLinkPreview: actionLink.substring(0, 100) + '...',
      redirectTarget: redirectUrl,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Magic link sent to your email',
        debug: {
          emailId: emailResponse.data?.id,
          linkGenerated: true,
          redirectUrl: redirectUrl,
          timestamp: new Date().toISOString(),
          environment: 'production'
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
        environment: 'production'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);
