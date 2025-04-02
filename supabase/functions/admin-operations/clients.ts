
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

export async function createClients(req) {
  // Get the authorization header
  const authorization = req.headers.get("Authorization") || "";
  
  // Create a Supabase client with the auth context of the logged in user
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: authorization },
      },
    }
  );

  // Create a special admin client using service role key for operations that need to bypass RLS
  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  return { authorization, supabase, adminClient };
}
