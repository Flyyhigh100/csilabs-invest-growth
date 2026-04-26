
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface PriceProxyRequest {
  source: 'rpc' | 'graph' | 'defined' | 'dexscreener';
  method?: string;
  url?: string;
  body?: any;
  headers?: Record<string, string>;
}

interface PriceProxyResponse {
  success: boolean;
  data?: any;
  error?: string;
  source: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { source, method = 'GET', url, body, headers = {} }: PriceProxyRequest = await req.json();
    
    console.log(`[PRICE PROXY] Request for source: ${source}`);
    
    let targetUrl: string;
    let requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    // Add body for POST requests
    if (method === 'POST' && body) {
      requestOptions.body = JSON.stringify(body);
    }

    // Handle different API sources
    switch (source) {
      case 'rpc':
        targetUrl = url || 'https://polygon-bor.publicnode.com/';
        break;
        
      case 'graph':
        targetUrl = 'https://gateway.thegraph.com/api/39814f0ec0acd4d370f434eefa12fa7c/subgraphs/id/3hCPRGf4z88VC5rsBKU5AA9FBBq5nF3jbKJG7VZCbhjm';
        break;
        
      case 'defined':
        targetUrl = 'https://api.defined.fi/api/v0/query';
        // Add defined.fi API key from secrets
        const definedApiKey = Deno.env.get('DEFINED_API_KEY');
        if (definedApiKey) {
          requestOptions.headers = {
            ...requestOptions.headers,
            'Authorization': `Bearer ${definedApiKey}`
          };
        }
        break;
        
      case 'dexscreener':
        targetUrl = url || 'https://api.dexscreener.com/latest/dex/pairs/polygon/0xb85372c56884a906ab33c0e99fea572c7c6ad7eb';
        break;
        
      default:
        throw new Error(`Unsupported source: ${source}`);
    }

    console.log(`[PRICE PROXY] Making request to: ${targetUrl}`);
    
    // Make the actual API call
    const response = await fetch(targetUrl, requestOptions);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`[PRICE PROXY] Success for ${source}`);
    
    const result: PriceProxyResponse = {
      success: true,
      data,
      source
    };

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('[PRICE PROXY] Error:', error);
    
    const result: PriceProxyResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'proxy'
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
