
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
      .maybeSingle(); // Changed from .single() to .maybeSingle()

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

    // Mark the magic link as used first
    console.log('Marking magic link as used...');
    const { error: updateError } = await supabase
      .from('magic_links')
      .update({ used: true })
      .eq('token', token);

    if (updateError) {
      console.error('Error marking magic link as used:', updateError);
    }

    // Check if user exists
    console.log('Checking if user exists...');
    const { data: usersData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error listing users:', userError);
      throw new Error('Failed to check user existence');
    }

    const existingUser = usersData.users.find(user => user.email === magicLink.email);
    
    let userId: string;
    
    if (!existingUser) {
      console.log('Creating new user...');
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: magicLink.email,
        email_confirm: true,
      });
      
      if (createError) {
        console.error('Error creating user:', createError);
        // If user already exists, try to find them
        if (createError.message.includes('already been registered')) {
          console.log('User already exists, finding existing user...');
          const existingUserRetry = usersData.users.find(user => user.email === magicLink.email);
          if (existingUserRetry) {
            userId = existingUserRetry.id;
            console.log('Found existing user with ID:', userId);
          } else {
            throw new Error('Failed to create or find user account');
          }
        } else {
          throw new Error('Failed to create user account');
        }
      } else if (newUser.user) {
        userId = newUser.user.id;
        console.log('New user created with ID:', userId);
      } else {
        throw new Error('Failed to create user account');
      }
    } else {
      userId = existingUser.id;
      console.log('Existing user found with ID:', userId);
    }

    // Generate a sign-in link for the user
    console.log('Generating sign-in link...');
    const { data: linkData, error: linkGenError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: magicLink.email,
    });

    if (linkGenError || !linkData) {
      console.error('Error generating sign-in link:', linkGenError);
      throw new Error('Failed to create authentication session');
    }

    console.log('Sign-in link generated successfully');
    
    // Extract tokens from the generated link
    const actionLink = linkData.properties.action_link;
    const urlParams = new URL(actionLink).searchParams;
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    if (!accessToken || !refreshToken) {
      console.error('Failed to extract tokens from action link');
      throw new Error('Failed to create authentication session');
    }

    console.log('Tokens extracted successfully');
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
