
// Follow Deno Edge Function format
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'

// This edge function handles research document uploads with service role permissions
// to bypass RLS issues when regular uploads fail

// Get Supabase client with service role key (has admin privileges)
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      persistSession: false,
    }
  }
)

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const requestData = await req.json()
    const { fileName, fileBase64, metadata, userId } = requestData
    
    if (!fileName || !fileBase64 || !metadata) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: fileName, fileBase64, or metadata' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Processing document upload for file: ${fileName}`)
    console.log(`Metadata: title=${metadata.title}, category=${metadata.category}`)
    
    // Decode the base64 file
    const base64Data = fileBase64.split(',')[1] // Remove data URL prefix if present
    const fileData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
    
    // Generate storage path
    const timestamp = Date.now()
    const fileExt = fileName.split('.').pop()
    const safeTitle = metadata.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
    const filePath = `${timestamp}_${safeTitle}.${fileExt}`
    
    console.log(`Storage file path: ${filePath}`)
    
    // 1. Upload file to storage using admin client
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('research_documents')
      .upload(filePath, fileData, {
        contentType: 'application/pdf',
        upsert: true
      })
      
    if (uploadError) {
      console.error('Error uploading file to storage:', uploadError)
      return new Response(
        JSON.stringify({ error: `Upload failed: ${uploadError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Get public URL for the file
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('research_documents')
      .getPublicUrl(filePath)
      
    const fileUrl = publicUrlData.publicUrl
    console.log('File uploaded successfully, URL:', fileUrl)
    
    // 2. Insert document metadata into database
    const documentData = {
      title: metadata.title,
      description: metadata.description,
      category: metadata.category,
      file_path: fileUrl,
      published_at: new Date(metadata.publishDate).toISOString(),
      authors: metadata.authors || null,
      created_by: userId // Use the passed user ID
    }
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('documents')
      .insert(documentData)
      .select()
      .single()
      
    if (insertError) {
      console.error('Error inserting document metadata:', insertError)
      
      // Clean up uploaded file since metadata insertion failed
      await supabaseAdmin.storage
        .from('research_documents')
        .remove([filePath])
        
      return new Response(
        JSON.stringify({ error: `Failed to save document metadata: ${insertError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    console.log('Document metadata inserted successfully:', insertData)
    
    // Return success with the document data
    return new Response(
      JSON.stringify({
        success: true,
        document: insertData
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
    
  } catch (err) {
    console.error('Unexpected error in document upload:', err)
    
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${err.message}` }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
