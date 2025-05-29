
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const documentId = url.searchParams.get('id');

    if (!documentId) {
      return new Response('Document ID is required', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Look up the document by ID
    const { data: document, error } = await supabase
      .from('documents')
      .select('file_path, title')
      .eq('id', documentId)
      .single();

    if (error || !document) {
      console.error('Document not found:', error);
      return new Response('Document not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Extract the file path from the full URL if it's a complete URL
    let filePath = document.file_path;
    if (filePath.includes('/storage/v1/object/public/research_documents/')) {
      const parts = filePath.split('/storage/v1/object/public/research_documents/');
      filePath = parts[1];
    }

    // Generate the public URL for the document
    const { data: publicUrlData } = supabase.storage
      .from('research_documents')
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      return new Response('Failed to generate document URL', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    // Redirect to the actual document URL
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': publicUrlData.publicUrl,
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });

  } catch (error) {
    console.error('Error in document-proxy function:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
