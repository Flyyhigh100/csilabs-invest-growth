
// Follow Supabase Edge Functions guide:
// https://supabase.com/docs/guides/functions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get request data
    const { force = false } = await req.json()
    console.log('Setup storage request received, force:', force)

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // List existing buckets
    const { data: existingBuckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      throw new Error(`Cannot access storage: ${listError.message}`)
    }

    console.log('Existing buckets:', existingBuckets?.map(b => b.name) || 'none')
    
    // Define required buckets
    const requiredBuckets = [
      { id: 'kyc-documents', name: 'KYC Documents', public: false },
      { id: 'documents', name: 'General Documents', public: false },
    ]
    
    // Create or update buckets
    const results = []
    
    for (const bucket of requiredBuckets) {
      const bucketExists = existingBuckets?.some(b => b.id === bucket.id)
      
      if (bucketExists && !force) {
        console.log(`Bucket "${bucket.id}" already exists, skipping`)
        results.push({ bucket: bucket.id, status: 'exists' })
        continue
      }
      
      // If force is true or bucket doesn't exist, create it (will replace if exists)
      if (bucketExists) {
        // Delete existing bucket first if we're forcing
        const { error: deleteError } = await supabaseAdmin.storage.deleteBucket(bucket.id)
        if (deleteError) {
          console.error(`Error deleting bucket "${bucket.id}":`, deleteError)
          results.push({ bucket: bucket.id, status: 'error', message: deleteError.message })
          continue
        }
      }
      
      // Create the bucket
      const { data, error: createError } = await supabaseAdmin.storage.createBucket(
        bucket.id, {
          public: bucket.public,
          fileSizeLimit: 5 * 1024 * 1024, // 5MB
        }
      )
      
      if (createError) {
        console.error(`Error creating bucket "${bucket.id}":`, createError)
        results.push({ bucket: bucket.id, status: 'error', message: createError.message })
      } else {
        console.log(`Bucket "${bucket.id}" created successfully`)
        results.push({ bucket: bucket.id, status: 'created' })
      }
    }
    
    // List buckets after operations to confirm status
    const { data: updatedBuckets } = await supabaseAdmin.storage.listBuckets()
    
    return new Response(
      JSON.stringify({
        success: true,
        results,
        buckets: updatedBuckets?.map(b => b.name),
        complete: true,
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in setup-storage function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
        status: 500,
      }
    )
  }
})
