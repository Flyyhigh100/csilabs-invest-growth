
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
export async function makeProxyRequest(request: ProxyRequest): Promise<any> {
  try {
    console.log(`[PROXY SERVICE] Making proxy request for ${request.source}`);
    
    const { data, error } = await supabase.functions.invoke('crypto-price-proxy', {
      body: request
    });

    if (error) {
      console.error(`[PROXY SERVICE] Edge function error:`, error);
      throw new Error(`Proxy request failed: ${error.message}`);
    }

    const response: ProxyResponse = data;
    
    if (!response.success) {
      console.error(`[PROXY SERVICE] Proxy returned error:`, response.error);
      throw new Error(response.error || 'Proxy request failed');
    }

    console.log(`[PROXY SERVICE] Success for ${request.source}`);
    return response.data;

  } catch (error) {
    console.error(`[PROXY SERVICE] Error making proxy request:`, error);
    throw error;
  }
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
