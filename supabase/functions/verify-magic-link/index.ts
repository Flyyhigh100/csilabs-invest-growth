
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface VerifyMagicLinkRequest {
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('=== VERIFY MAGIC LINK START ===');
  console.log('Request method:', req.method);

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

    // Find the magic link using maybeSingle() to avoid errors when no rows found
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

    // Check if link has expired
    if (new Date(magicLink.expires_at) < new Date()) {
      console.error('Magic link has expired');
      return new Response(
        JSON.stringify({ error: 'Magic link has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Check if user exists
    console.log('Step 1: Checking if user exists with email:', magicLink.email);
    const { data: usersData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error listing users:', userError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify user status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const existingUser = usersData.users.find(user => user.email === magicLink.email);
    let userId: string;
    
    if (existingUser) {
      // Step 2A: User exists - authenticate them
      console.log('Step 2A: User exists with ID:', existingUser.id);
      userId = existingUser.id;
      
      // For existing users, we'll generate a session directly
      console.log('Generating session for existing user...');
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: magicLink.email,
          options: {
            redirectTo: 'https://1millionstrongfightclub.com/dashboard/payments'
          }
        });

        if (sessionError) {
          console.error('Error generating session for existing user:', sessionError);
          return new Response(
            JSON.stringify({ error: 'Failed to create authentication session' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Session generated successfully for existing user');
        
        // Extract tokens from the generated link
        const actionLink = sessionData.properties.action_link;
        console.log('Action link generated:', actionLink.substring(0, 100) + '...');
        
        const url = new URL(actionLink);
        const accessToken = url.searchParams.get('access_token');
        const refreshToken = url.searchParams.get('refresh_token');

        if (!accessToken || !refreshToken) {
          console.error('Failed to extract tokens from action link');
          console.log('Available URL params:', Array.from(url.searchParams.keys()));
          return new Response(
            JSON.stringify({ error: 'Failed to create authentication session - no tokens' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Tokens extracted successfully for existing user');

        // Mark magic link as used ONLY after successful authentication
        console.log('Marking magic link as used...');
        const { error: updateError } = await supabase
          .from('magic_links')
          .update({ used: true })
          .eq('token', token);

        if (updateError) {
          console.error('Error marking magic link as used:', updateError);
          // Don't fail here - authentication was successful
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            user: { id: userId, email: magicLink.email },
            access_token: accessToken,
            refresh_token: refreshToken,
            redirectUrl: '/dashboard/payments'
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );

      } catch (authError: any) {
        console.error('Authentication failed for existing user:', authError);
        return new Response(
          JSON.stringify({ error: 'Authentication failed: ' + authError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
    } else {
      // Step 2B: User doesn't exist - create new user
      console.log('Step 2B: User does not exist, creating new user...');
      try {
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: magicLink.email,
          email_confirm: true,
        });
        
        if (createError) {
          console.error('Error creating user:', createError);
          return new Response(
            JSON.stringify({ error: 'Failed to create user account: ' + createError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (!newUser.user) {
          console.error('User creation returned no user object');
          return new Response(
            JSON.stringify({ error: 'Failed to create user account - no user returned' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        userId = newUser.user.id;
        console.log('New user created with ID:', userId);

        // Generate session for new user
        console.log('Generating session for new user...');
        const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: magicLink.email,
          options: {
            redirectTo: 'https://1millionstrongfightclub.com/dashboard/payments'
          }
        });

        if (sessionError) {
          console.error('Error generating session for new user:', sessionError);
          return new Response(
            JSON.stringify({ error: 'Failed to create authentication session for new user' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Extract tokens from the generated link
        const actionLink = sessionData.properties.action_link;
        console.log('Action link generated for new user:', actionLink.substring(0, 100) + '...');
        
        const url = new URL(actionLink);
        const accessToken = url.searchParams.get('access_token');
        const refreshToken = url.searchParams.get('refresh_token');

        if (!accessToken || !refreshToken) {
          console.error('Failed to extract tokens from action link for new user');
          console.log('Available URL params:', Array.from(url.searchParams.keys()));
          return new Response(
            JSON.stringify({ error: 'Failed to create authentication session - no tokens for new user' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Tokens extracted successfully for new user');

        // Mark magic link as used
        console.log('Marking magic link as used for new user...');
        const { error: updateError } = await supabase
          .from('magic_links')
          .update({ used: true })
          .eq('token', token);

        if (updateError) {
          console.error('Error marking magic link as used:', updateError);
          // Don't fail here - authentication was successful
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            user: { id: userId, email: magicLink.email },
            access_token: accessToken,
            refresh_token: refreshToken,
            redirectUrl: '/dashboard/payments'
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );

      } catch (createError: any) {
        console.error('User creation process failed:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create new user: ' + createError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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
