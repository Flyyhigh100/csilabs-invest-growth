
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

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

    console.log('✅ Magic link process completed successfully:', {
      recipientEmail: email,
      redirectTarget: redirectUrl,
      timestamp: new Date().toISOString(),
      flow: 'native-supabase'
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Magic link sent to your email',
        timestamp: new Date().toISOString(),
        environment: 'production',
        flow: 'native-supabase'
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
