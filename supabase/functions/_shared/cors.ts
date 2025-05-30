
// Create CORS headers for all edge functions to use
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-access',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
}
