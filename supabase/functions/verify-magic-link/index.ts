
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface VerifyMagicLinkRequest {
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('=== VERIFY MAGIC LINK START ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Parsing request body...');
    const requestBody = await req.text();
    console.log('Raw request body:', requestBody);
    
    let token: string;
    try {
      const parsed = JSON.parse(requestBody);
      token = parsed.token;
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request body format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!token) {
      console.error('No token provided in request');
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Token received:', token.substring(0, 20) + '...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      throw new Error('Server configuration error');
    }

    console.log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Validate the magic link token
    console.log('Looking up magic link token...');
    const { data: magicLink, error: linkError } = await supabase
      .from('magic_links')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .maybeSingle();

    if (linkError) {
      console.error('Database error finding magic link:', linkError);
      return new Response(
        JSON.stringify({ error: 'Database error occurred' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!magicLink) {
      console.error('Magic link not found or already used for token:', token.substring(0, 20) + '...');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired magic link' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Magic link found for email:', magicLink.email);

    // Step 2: Check if link has expired
    if (new Date(magicLink.expires_at) < new Date()) {
      console.error('Magic link has expired');
      return new Response(
        JSON.stringify({ error: 'Magic link has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Use Supabase's native signInWithOtp for reliable authentication
    console.log('Attempting sign in with OTP using Supabase native method...');
    
    try {
      // Create a custom OTP token for this email
      const { data: otpData, error: otpError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: magicLink.email,
        options: {
          redirectTo: 'https://1millionstrongfightclub.com/dashboard/payments'
        }
      });

      if (otpError) {
        console.error('Error generating OTP link:', otpError);
        return new Response(
          JSON.stringify({ error: 'Failed to generate authentication link' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('OTP link generated successfully');

      // Extract the actual OTP token from the action link
      const actionLink = otpData.properties.action_link;
      console.log('Action link generated:', actionLink.substring(0, 100) + '...');
      
      const url = new URL(actionLink);
      const otpToken = url.searchParams.get('token');
      const type = url.searchParams.get('type');

      if (!otpToken) {
        console.error('Failed to extract OTP token from action link');
        return new Response(
          JSON.stringify({ error: 'Failed to generate valid authentication token' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('OTP token extracted successfully');

      // Now verify the OTP using Supabase's native method
      console.log('Verifying OTP token...');
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email: magicLink.email,
        token: otpToken,
        type: 'email'
      });

      if (verifyError) {
        console.error('Error verifying OTP:', verifyError);
        return new Response(
          JSON.stringify({ error: 'Failed to verify authentication token' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!verifyData.user || !verifyData.session) {
        console.error('OTP verification returned no user or session');
        return new Response(
          JSON.stringify({ error: 'Authentication verification failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('OTP verified successfully for user:', verifyData.user.id);

      // Step 4: Mark magic link as used ONLY after successful authentication
      console.log('Marking magic link as used...');
      const { error: updateError } = await supabase
        .from('magic_links')
        .update({ used: true })
        .eq('token', token);

      if (updateError) {
        console.error('Error marking magic link as used:', updateError);
        // Don't fail here - authentication was successful
      } else {
        console.log('Magic link marked as used successfully');
      }

      // Step 5: Return the session tokens
      return new Response(
        JSON.stringify({ 
          success: true,
          user: { 
            id: verifyData.user.id, 
            email: verifyData.user.email 
          },
          access_token: verifyData.session.access_token,
          refresh_token: verifyData.session.refresh_token,
          redirectUrl: '/dashboard/payments'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (authError: any) {
      console.error('Authentication process failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed: ' + authError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('Unhandled error in verify-magic-link function:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to verify magic link',
        details: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);
