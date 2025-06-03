
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface VerifyMagicLinkRequest {
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token }: VerifyMagicLinkRequest = await req.json();
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find the magic link
    const { data: magicLink, error: linkError } = await supabase
      .from('magic_links')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (linkError || !magicLink) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired magic link' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if link has expired
    if (new Date(magicLink.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Magic link has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark the magic link as used
    await supabase
      .from('magic_links')
      .update({ used: true })
      .eq('token', token);

    // Check if user exists, if not create them
    const { data: existingUser, error: userError } = await supabase.auth.admin.getUserByEmail(magicLink.email);
    
    let userId: string;
    
    if (userError || !existingUser.user) {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: magicLink.email,
        email_confirm: true,
      });
      
      if (createError || !newUser.user) {
        console.error('Error creating user:', createError);
        throw new Error('Failed to create user account');
      }
      
      userId = newUser.user.id;
    } else {
      userId = existingUser.user.id;
    }

    // Generate session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: magicLink.email,
    });

    if (sessionError) {
      console.error('Error generating session:', sessionError);
      throw new Error('Failed to create session');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        session: sessionData,
        redirectUrl: '/dashboard/payments'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in verify-magic-link function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to verify magic link' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);
