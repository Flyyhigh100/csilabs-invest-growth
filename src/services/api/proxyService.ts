
import { supabase } from '@/integrations/supabase/client';

interface ProxyRequest {
  source: 'rpc' | 'graph' | 'defined' | 'dexscreener';
  method?: string;
  url?: string;
  body?: any;
  headers?: Record<string, string>;
}

interface ProxyResponse {
  success: boolean;
  data?: any;
  error?: string;
  source: string;
}

/**
 * Makes API calls through the Supabase edge function proxy to bypass network restrictions
 */
const MAX_EDGE_RETRIES = 2;
const EDGE_RETRY_DELAY_MS = 800;

const isTransientEdgeError = (err: any): boolean => {
  const msg = (err?.message || '').toString().toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('temporarily unavailable') ||
    msg.includes('supabase_edge_runtime_error') ||
    msg.includes('failed to fetch') ||
    msg.includes('networkerror')
  );
};

export async function makeProxyRequest(request: ProxyRequest): Promise<any> {
  let attempt = 0;
  let lastError: any;

  while (attempt <= MAX_EDGE_RETRIES) {
    try {
      console.log(`[PROXY SERVICE] Making proxy request for ${request.source} (attempt ${attempt + 1})`);

      const { data, error } = await supabase.functions.invoke('crypto-price-proxy', {
        body: request
      });

      if (error) {
        // Retry transient runtime errors (cold start / 503)
        if (isTransientEdgeError(error) && attempt < MAX_EDGE_RETRIES) {
          console.warn(`[PROXY SERVICE] Transient edge error, retrying in ${EDGE_RETRY_DELAY_MS * (attempt + 1)}ms`);
          await new Promise((r) => setTimeout(r, EDGE_RETRY_DELAY_MS * (attempt + 1)));
          attempt++;
          continue;
        }
        console.error(`[PROXY SERVICE] Edge function error:`, error);
        throw new Error(`Proxy request failed: ${error.message}`);
      }

      const response: ProxyResponse = data;

      if (!response?.success) {
        console.error(`[PROXY SERVICE] Proxy returned error:`, response?.error);
        throw new Error(response?.error || 'Proxy request failed');
      }

      console.log(`[PROXY SERVICE] Success for ${request.source}`);
      return response.data;
    } catch (error) {
      lastError = error;
      if (isTransientEdgeError(error) && attempt < MAX_EDGE_RETRIES) {
        await new Promise((r) => setTimeout(r, EDGE_RETRY_DELAY_MS * (attempt + 1)));
        attempt++;
        continue;
      }
      console.error(`[PROXY SERVICE] Error making proxy request:`, error);
      throw error;
    }
  }

  throw lastError ?? new Error('Proxy request failed');
}

/**
 * Makes RPC calls through the proxy
 */
export async function makeRpcCall(method: string, params: any[] = [], url?: string): Promise<any> {
  const body = {
    method,
    params,
    id: Date.now(),
    jsonrpc: "2.0"
  };

  return makeProxyRequest({
    source: 'rpc',
    method: 'POST',
    url,
    body
  });
}

/**
 * Makes GraphQL calls through the proxy
 */
export async function makeGraphQLCall(query: string, variables?: any): Promise<any> {
  return makeProxyRequest({
    source: 'graph',
    method: 'POST',
    body: { query, variables }
  });
}

/**
 * Makes Defined.fi API calls through the proxy
 */
export async function makeDefinedCall(query: string): Promise<any> {
  return makeProxyRequest({
    source: 'defined',
    method: 'POST',
    body: { query }
  });
}

/**
 * Makes DexScreener API calls through the proxy
 */
export async function makeDexScreenerCall(pairAddress?: string): Promise<any> {
  const url = pairAddress 
    ? `https://api.dexscreener.com/latest/dex/pairs/polygon/${pairAddress}`
    : undefined;
    
  return makeProxyRequest({
    source: 'dexscreener',
    method: 'GET',
    url
  });
}
