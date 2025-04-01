
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
    let body = {};
    try {
      body = await req.json();
    } catch {
      // Silently handle JSON parsing errors, using defaults
      body = {};
    }
    
    const forceRecreation = body.force === true;
    
    // Create a Supabase client with the service role key (this has admin privileges)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }
    
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
    
    // Optionally delete buckets if force recreation is specified
    if (forceRecreation && buckets) {
      console.log("Force recreation requested, attempting to recreate buckets");
      for (const bucket of buckets) {
        if (requiredBuckets.some(reqBucket => reqBucket.name === bucket.name)) {
          console.log(`Deleting bucket: ${bucket.name} for recreation`);
          try {
            const { error: deleteError } = await supabase.storage.deleteBucket(bucket.name);
            if (deleteError) {
              results.push({
                bucket: bucket.name,
                status: 'error',
                message: `Failed to delete bucket: ${deleteError.message}`
              });
            } else {
              results.push({
                bucket: bucket.name,
                status: 'deleted',
                message: 'Bucket deleted for recreation'
              });
            }
          } catch (err) {
            results.push({
              bucket: bucket.name,
              status: 'error',
              message: `Exception deleting bucket: ${err.message}`
            });
          }
        }
      }
    }
    
    // Refresh bucket list after potential deletions
    const { data: updatedBuckets, error: refreshError } = await supabase.storage.listBuckets();
    const existingBucketNames = refreshError || !updatedBuckets ? [] : updatedBuckets.map(b => b.name);
    
    // Create buckets that don't exist
    for (const bucket of requiredBuckets) {
      const bucketExists = existingBucketNames.includes(bucket.name);
      
      if (!bucketExists) {
        try {
          console.log(`Creating bucket: ${bucket.name}`);
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
            try {
              const { error: policyError } = await supabase.rpc('create_storage_policy', {
                bucket_name: bucket.name
              });
              
              results.push({
                bucket: bucket.name,
                status: 'created',
                policy: policyError ? `Failed to create policy: ${policyError.message}` : 'created'
              });
            } catch (policyErr) {
              results.push({
                bucket: bucket.name,
                status: 'created',
                policy: `Exception creating policy: ${policyErr.message}`
              });
            }
          }
        } catch (createErr) {
          results.push({
            bucket: bucket.name,
            status: 'error',
            message: `Exception creating bucket: ${createErr.message}`
          });
        }
      } else {
        results.push({
          bucket: bucket.name,
          status: 'exists'
        });
      }
    }
    
    // Final verification - check if all buckets now exist
    const { data: finalBuckets, error: finalError } = await supabase.storage.listBuckets();
    const allBucketsExist = !finalError && finalBuckets && 
      requiredBuckets.every(reqBucket => 
        finalBuckets.some(b => b.name === reqBucket.name)
      );
    
    return new Response(
      JSON.stringify({ 
        success: allBucketsExist, 
        results,
        buckets: finalBuckets ? finalBuckets.map(b => b.name) : [],
        complete: allBucketsExist
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: allBucketsExist ? 200 : 207 // Partial success
      }
    );
  } catch (error) {
    console.error("Error in setup-storage:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error",
        stack: error.stack || null
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 500
      }
    );
  }
});
