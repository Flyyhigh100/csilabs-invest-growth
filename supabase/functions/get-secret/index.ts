
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

interface WebhookPayload {
  secret_name: string;
}

serve(async (req) => {
  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the secret name from the request
    const { secret_name } = await req.json() as WebhookPayload;

    if (!secret_name) {
      return new Response(
        JSON.stringify({ error: 'Secret name is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the secret value
    const { data, error } = await supabaseClient
      .from('secrets')
      .select('value')
      .eq('name', secret_name)
      .single();

    if (error) {
      console.error('Error fetching secret:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch secret' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data?.value) {
      return new Response(
        JSON.stringify({ error: 'Secret not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data.value),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
