
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate a secure token
    const token = crypto.randomUUID() + '-' + crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Clean up old magic links for this email
    await supabase
      .from('magic_links')
      .delete()
      .eq('email', email);

    // Insert new magic link
    const { error: insertError } = await supabase
      .from('magic_links')
      .insert({
        email,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Error inserting magic link:', insertError);
      throw new Error('Failed to create magic link');
    }

    // Create the magic link URL
    const baseUrl = req.headers.get('origin') || 'https://your-app-domain.com';
    const magicLinkUrl = `${baseUrl}/auth/magic-link?token=${token}`;

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "CSi Labs <noreply@your-domain.com>", // Update with your verified domain
      to: [email],
      subject: "Sign in to CSi Labs",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sign in to CSi Labs</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${baseUrl}/Newlogo.jpg" alt="CSi Labs" style="height: 60px; width: auto;">
            </div>
            
            <h1 style="color: #1e40af; text-align: center; margin-bottom: 30px;">Sign in to CSi Labs</h1>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hello! You requested to sign in to your CSi Labs account. Click the button below to securely access your dashboard:
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
                Sign In to CSi Labs
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
                <strong>CSi Labs</strong> - Revolutionizing Cancer Research
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Magic link email sent:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Magic link sent to your email' 
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
