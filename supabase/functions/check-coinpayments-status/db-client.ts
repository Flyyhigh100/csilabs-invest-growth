
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

export function createDbClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  return createClient(supabaseUrl, supabaseKey);
}
