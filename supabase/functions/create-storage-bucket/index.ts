
// create-storage-bucket edge function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.3'

interface CreateBucketRequest {
  bucketName: string;
  isPublic?: boolean;
  fileSizeLimit?: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://hrhvliqkmetcdphnetxb.supabase.co'
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey
    )

    // First verify that the user is an admin
    const supabase = createClient(
      supabaseUrl,
      authHeader.replace('Bearer ', ''),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        }
      }
    )

    // Check if user is admin using the RPC function
    const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin')
    
    if (adminCheckError || !isAdmin) {
      console.error('Admin check failed:', adminCheckError)
      return new Response(
        JSON.stringify({ error: 'Not authorized. Admin privileges required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the request body
    const { bucketName, isPublic = true, fileSizeLimit = 10485760 } = await req.json() as CreateBucketRequest

    if (!bucketName) {
      return new Response(
        JSON.stringify({ error: 'Bucket name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if bucket already exists
    const { data: existingBuckets, error: listError } = await supabaseAdmin
      .storage
      .listBuckets()

    if (listError) {
      return new Response(
        JSON.stringify({ error: `Error listing buckets: ${listError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const bucketExists = existingBuckets.some(bucket => bucket.name === bucketName)
    
    if (bucketExists) {
      return new Response(
        JSON.stringify({ message: `Bucket ${bucketName} already exists`, bucketExists: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create the bucket
    const { data, error } = await supabaseAdmin
      .storage
      .createBucket(bucketName, {
        public: isPublic,
        fileSizeLimit: fileSizeLimit,
      })

    if (error) {
      return new Response(
        JSON.stringify({ error: `Error creating bucket: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        message: `Bucket ${bucketName} created successfully`, 
        success: true,
        bucketName
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
