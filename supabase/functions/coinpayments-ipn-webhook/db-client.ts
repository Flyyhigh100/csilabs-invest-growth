
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Create Supabase client for database operations
export function createDbClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    throw new Error('Database configuration missing');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}
