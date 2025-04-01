
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with the service role key (this has admin privileges)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Required buckets for the application
    const requiredBuckets = [
      { name: 'kyc-documents', public: true },
      { name: 'documents', public: true }
    ];
    
    const results = [];
    
    // First check existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }
    
    // Create buckets that don't exist
    for (const bucket of requiredBuckets) {
      const bucketExists = buckets?.some(b => b.name === bucket.name);
      
      if (!bucketExists) {
        const { data, error } = await supabase.storage.createBucket(
          bucket.name, 
          { public: bucket.public }
        );
        
        if (error) {
          results.push({
            bucket: bucket.name,
            status: 'error',
            message: `Failed to create bucket: ${error.message}`
          });
        } else {
          // Create RLS policy to allow uploads for authenticated users
          const { error: policyError } = await supabase.rpc('create_storage_policy', {
            bucket_name: bucket.name
          });
          
          results.push({
            bucket: bucket.name,
            status: 'created',
            policy: policyError ? `Failed to create policy: ${policyError.message}` : 'created'
          });
        }
      } else {
        results.push({
          bucket: bucket.name,
          status: 'exists'
        });
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, results }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 200 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 400 
      }
    );
  }
});
