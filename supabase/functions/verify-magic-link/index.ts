
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface VerifyMagicLinkRequest {
  token: string;
  type?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('=== VERIFY MAGIC LINK START ===');
  console.log('🔧 PRODUCTION DEBUGGING - Enhanced verification logging');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  console.log('Timestamp:', new Date().toISOString());

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 VERIFY MAGIC LINK FUNCTION CALLED - Production debugging active!');
    
    const requestBody = await req.text();
    console.log('📨 Raw request body received:', requestBody);
    
    let token: string;
    let type: string = 'email';
    
    try {
      const parsed = JSON.parse(requestBody);
      token = parsed.token;
      type = parsed.type || 'email';
      console.log('📋 Parsed request:', { 
        hasToken: !!token, 
        tokenLength: token?.length,
        tokenPreview: token?.substring(0, 30) + '...',
        type,
        fullParsed: parsed
      });
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request body format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!token) {
      console.error('❌ No token provided in request');
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔐 Token received for verification:', token.substring(0, 30) + '...');
    console.log('🏷️ Verification type:', type);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables');
      throw new Error('Server configuration error');
    }

    console.log('🔧 Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Use Supabase's native verifyOtp method with enhanced logging
    console.log('🔐 Verifying OTP token with Supabase...');
    
    const verifyPayload = {
      token: token,
      type: type as any
    };
    
    console.log('📋 Verification payload:', { 
      hasToken: !!verifyPayload.token,
      tokenLength: verifyPayload.token?.length,
      type: verifyPayload.type 
    });

    const { data: verifyResult, error: verifyError } = await supabase.auth.verifyOtp(verifyPayload);

    console.log('📊 Supabase verifyOtp response:', {
      hasData: !!verifyResult,
      hasUser: !!verifyResult?.user,
      hasSession: !!verifyResult?.session,
      userId: verifyResult?.user?.id,
      userEmail: verifyResult?.user?.email,
      hasError: !!verifyError,
      errorMessage: verifyError?.message,
      errorDetails: verifyError
    });

    if (verifyError) {
      console.error('❌ Error verifying OTP:', verifyError);
      
      // Enhanced error handling with specific messages
      if (verifyError.message && verifyError.message.includes('expired')) {
        return new Response(
          JSON.stringify({ 
            error: 'This magic link has expired. Please request a new one.',
            code: 'EXPIRED_TOKEN',
            timestamp: new Date().toISOString()
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else if (verifyError.message && (verifyError.message.includes('invalid') || verifyError.message.includes('not found'))) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid magic link. Please request a new one.',
            code: 'INVALID_TOKEN',
            timestamp: new Date().toISOString()
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ 
            error: 'Magic link verification failed: ' + verifyError.message,
            code: 'VERIFICATION_FAILED',
            details: verifyError,
            timestamp: new Date().toISOString()
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!verifyResult.user || !verifyResult.session) {
      console.error('❌ OTP verification returned no user or session');
      return new Response(
        JSON.stringify({ 
          error: 'Authentication verification failed - no session created',
          code: 'NO_SESSION_CREATED',
          timestamp: new Date().toISOString()
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ OTP verified successfully for user:', verifyResult.user.id);
    console.log('🔑 Session tokens available:', {
      hasAccessToken: !!verifyResult.session.access_token,
      hasRefreshToken: !!verifyResult.session.refresh_token,
      accessTokenLength: verifyResult.session.access_token?.length,
      refreshTokenLength: verifyResult.session.refresh_token?.length,
      expiresAt: verifyResult.session.expires_at
    });

    // Return the session tokens
    const response = {
      success: true,
      user: { 
        id: verifyResult.user.id, 
        email: verifyResult.user.email 
      },
      access_token: verifyResult.session.access_token,
      refresh_token: verifyResult.session.refresh_token,
      expires_at: verifyResult.session.expires_at,
      redirectUrl: '/dashboard/payments',
      timestamp: new Date().toISOString(),
      environment: 'production'
    };

    console.log('✅ Returning successful verification response for user:', verifyResult.user.email);

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('💥 Unhandled error in verify-magic-link function:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to verify magic link',
        code: 'INTERNAL_ERROR',
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
