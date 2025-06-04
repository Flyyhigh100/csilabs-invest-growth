
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface VerifyMagicLinkRequest {
  token: string;
  type?: string;
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
    let type: string = 'email'; // Default type
    
    try {
      const parsed = JSON.parse(requestBody);
      token = parsed.token;
      type = parsed.type || 'email';
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
    console.log('Type:', type);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      throw new Error('Server configuration error');
    }

    console.log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract email from the token if it's embedded (Supabase format)
    let email: string | null = null;
    
    // Try to decode the token to extract email
    try {
      // Supabase tokens are typically base64 encoded JSON
      const decodedToken = atob(token);
      const tokenData = JSON.parse(decodedToken);
      email = tokenData.email;
    } catch (decodeError) {
      console.log('Could not decode token, will proceed with verification anyway');
    }

    if (email) {
      console.log('Extracted email from token:', email);
    }

    // Use Supabase's native verifyOtp method
    console.log('Verifying OTP token with Supabase...');
    
    const verifyData: any = {
      token: token,
      type: type as any
    };

    if (email) {
      verifyData.email = email;
    }

    const { data: verifyResult, error: verifyError } = await supabase.auth.verifyOtp(verifyData);

    if (verifyError) {
      console.error('Error verifying OTP:', verifyError);
      
      // Handle specific error cases with user-friendly messages
      if (verifyError.message && verifyError.message.includes('expired')) {
        return new Response(
          JSON.stringify({ error: 'This magic link has expired. Please request a new one.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else if (verifyError.message && verifyError.message.includes('invalid')) {
        return new Response(
          JSON.stringify({ error: 'Invalid magic link. Please request a new one.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: 'Magic link verification failed: ' + verifyError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!verifyResult.user || !verifyResult.session) {
      console.error('OTP verification returned no user or session');
      return new Response(
        JSON.stringify({ error: 'Authentication verification failed - no session created' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('OTP verified successfully for user:', verifyResult.user.id);

    // Return the session tokens
    return new Response(
      JSON.stringify({ 
        success: true,
        user: { 
          id: verifyResult.user.id, 
          email: verifyResult.user.email 
        },
        access_token: verifyResult.session.access_token,
        refresh_token: verifyResult.session.refresh_token,
        redirectUrl: '/dashboard/payments'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

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
