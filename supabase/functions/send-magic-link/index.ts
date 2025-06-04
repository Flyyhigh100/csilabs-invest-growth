
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface MagicLinkRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: MagicLinkRequest = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing magic link request for email:', email);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate a truly unique token using crypto.randomUUID() and timestamp
    const timestamp = Date.now().toString();
    const randomPart1 = crypto.randomUUID();
    const randomPart2 = crypto.randomUUID();
    const token = `${randomPart1}-${timestamp}-${randomPart2}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    console.log('Generated new unique token:', token.substring(0, 30) + '...');
    console.log('Token timestamp:', timestamp);

    // Clean up ALL old magic links for this email (expired, used, and unused)
    console.log('Cleaning up all existing magic links for email:', email);
    const { error: cleanupError } = await supabase
      .from('magic_links')
      .delete()
      .eq('email', email);

    if (cleanupError) {
      console.error('Error cleaning up old magic links:', cleanupError);
      // Continue anyway - this isn't critical
    } else {
      console.log('Successfully cleaned up old magic links');
    }

    // Also clean up any expired magic links globally
    console.log('Cleaning up globally expired magic links...');
    const { error: globalCleanupError } = await supabase
      .from('magic_links')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (globalCleanupError) {
      console.error('Error with global cleanup:', globalCleanupError);
      // Continue anyway
    }

    // Insert new magic link with the unique token
    console.log('Inserting new magic link with token:', token.substring(0, 30) + '...');
    const { error: insertError } = await supabase
      .from('magic_links')
      .insert({
        email,
        token,
        expires_at: expiresAt.toISOString(),
        used: false
      });

    if (insertError) {
      console.error('Error inserting magic link:', insertError);
      throw new Error('Failed to create magic link: ' + insertError.message);
    }

    console.log('Magic link inserted successfully with unique token');

    // Verify the token was inserted correctly
    const { data: verifyToken, error: verifyError } = await supabase
      .from('magic_links')
      .select('token, email, expires_at, used')
      .eq('token', token)
      .single();

    if (verifyError || !verifyToken) {
      console.error('Token verification failed:', verifyError);
      throw new Error('Failed to verify token insertion');
    }

    console.log('Token verified in database:', {
      token: verifyToken.token.substring(0, 30) + '...',
      email: verifyToken.email,
      used: verifyToken.used
    });

    // Always use the production domain for magic link URLs
    const baseUrl = 'https://1millionstrongfightclub.com';
    const magicLinkUrl = `${baseUrl}/auth/magic-link?token=${token}`;

    console.log('Magic link URL created:', magicLinkUrl.substring(0, 60) + '...');

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "1 Million Strong Fight Club <team@mail.1millionstrongfightclub.com>",
      to: [email],
      subject: "Sign in to 1 Million Strong Fight Club",
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
              <img src="${baseUrl}/Newlogo.jpg" alt="1 Million Strong Fight Club" style="height: 60px; width: auto;">
            </div>
            
            <h1 style="color: #1e40af; text-align: center; margin-bottom: 30px;">Sign in to 1 Million Strong Fight Club</h1>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hello! You requested to sign in to your 1 Million Strong Fight Club account. Click the button below to securely access your dashboard:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${magicLinkUrl}" 
                 style="background: linear-gradient(to right, #1e40af, #0891b2); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 6px; 
                        font-weight: bold; 
                        display: inline-block;">
                Sign In to 1 Million Strong Fight Club
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="font-size: 14px; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
              ${magicLinkUrl}
            </p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
              <p>This link will expire in 30 minutes for security reasons.</p>
              <p>If you didn't request this email, you can safely ignore it.</p>
              <p style="text-align: center; margin-top: 20px;">
                <strong>1 Million Strong Fight Club</strong> - Building Community Strength
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Magic link email sent successfully:', {
      emailId: emailResponse.data?.id,
      token: token.substring(0, 30) + '...'
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Magic link sent to your email',
        tokenPreview: token.substring(0, 20) + '...' // For debugging
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in send-magic-link function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send magic link' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);
