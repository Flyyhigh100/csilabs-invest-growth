import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

// Helper function to create HMAC signature (inlined from utils.ts)
async function createSignature(params: Record<string, string>, privateKey: string): Promise<string> {
  const payload = new URLSearchParams(params).toString();
  console.log('Creating signature for payload:', payload);
  
  try {
    // Method 1: Try using the private key directly as UTF-8
    const encoder = new TextEncoder();
    const message = encoder.encode(payload);
    
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(privateKey),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      message
    );
    
    // Convert to hex string
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('Error in first signature attempt:', error);
    
    // Method 2: If the first method fails, try converting hex to bytes first
    try {
      // Convert hex key to bytes if it's in hex format
      const keyBytes = privateKey.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
      const keyBuffer = new Uint8Array(keyBytes);
      
      const encoder = new TextEncoder();
      const message = encoder.encode(payload);
      
      // Create HMAC using SubtleCrypto API with the byte array
      const key = await crypto.subtle.importKey(
        "raw",
        keyBuffer,
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["sign"]
      );
      
      const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        message
      );
      
      // Convert to hex string
      return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (fallbackError) {
      throw new Error(`Both signature methods failed. Original: ${error.message}, Fallback: ${fallbackError.message}`);
    }
  }
}

// Generate mock payment data - Not needed for this function but keeping the pattern complete
function generateMockPaymentData(amount: string, currencyCode: string = 'USDT'): any {
  // Mock implementation
  return {
    address: `mock_address_${currencyCode}_${Date.now()}`,
    amount: amount,
    txn_id: `CP${Date.now()}`,
    timeout: Math.floor(Date.now() / 1000) + 3600,
    qrcode_url: `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`${currencyCode.toLowerCase()}:mock_address`)}`,
    status_url: `https://www.coinpayments.net/index.php?cmd=status&id=CP${Date.now()}`,
    currency: currencyCode
  };
}

// Get available CoinPayments currencies (fully inlined)
async function getAvailableCurrencies(forceMock: boolean = false) {
  const COINPAYMENTS_API_URL = 'https://www.coinpayments.net/api.php';
  const COINPAYMENTS_PUBLIC_KEY = Deno.env.get('COINPAYMENTS_PUBLIC_KEY');
  const COINPAYMENTS_PRIVATE_KEY = Deno.env.get('COINPAYMENTS_PRIVATE_KEY');
  
  // If mock mode or missing API keys, return mock data
  if (forceMock || !COINPAYMENTS_PUBLIC_KEY || !COINPAYMENTS_PRIVATE_KEY) {
    console.log('Using mock currency data');
    return {
      BTC: { name: "Bitcoin", is_fiat: 0, rate_btc: "1.00", status: "online", accepted: 1 },
      LTC: { name: "Litecoin", is_fiat: 0, rate_btc: "0.01", status: "online", accepted: 1 },
      ETH: { name: "Ethereum", is_fiat: 0, rate_btc: "0.05", status: "online", accepted: 1 },
      DOGE: { name: "Dogecoin", is_fiat: 0, rate_btc: "0.000001", status: "online", accepted: 1 },
      USDT: { name: "Tether USD", is_fiat: 0, rate_btc: "0.000033", status: "online", accepted: 1 },
      BNB: { name: "Binance Coin", is_fiat: 0, rate_btc: "0.01", status: "online", accepted: 1 },
      XRP: { name: "Ripple", is_fiat: 0, rate_btc: "0.000025", status: "online", accepted: 1 },
      LTCT: { name: "Litecoin Testnet", is_fiat: 0, rate_btc: "0.01", status: "online", accepted: 1 },
    };
  }
  
  try {
    console.log('Fetching available currencies from CoinPayments API');
    
    // Add the required nonce parameter using the current timestamp
    const nonce = Date.now().toString();

    const requestParams = {
      cmd: "rates",
      key: COINPAYMENTS_PUBLIC_KEY,
      version: '1',
      format: 'json',
      nonce: nonce,
      accepted: "1"
    };

    const hmacSig = await createSignature(requestParams, COINPAYMENTS_PRIVATE_KEY);
    
    const response = await fetch(COINPAYMENTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': hmacSig,
      },
      body: new URLSearchParams(requestParams),
    });

    const data = await response.json();
    
    console.log(`Retrieved ${Object.keys(data.result).length} currencies from CoinPayments`);
    
    if (data.error !== 'ok') {
      console.error('CoinPayments API error:', data.error);
      throw new Error(`CoinPayments API error: ${data.error}`);
    }

    return data.result;
  } catch (error) {
    console.error('Error fetching currencies:', error);
    
    // Fall back to mock data if the API call fails
    return {
      BTC: { name: "Bitcoin", is_fiat: 0, rate_btc: "1.00", status: "online", accepted: 1 },
      ETH: { name: "Ethereum", is_fiat: 0, rate_btc: "0.05", status: "online", accepted: 1 },
      USDT: { name: "Tether USD", is_fiat: 0, rate_btc: "0.000033", status: "online", accepted: 1 },
      BNB: { name: "Binance Coin", is_fiat: 0, rate_btc: "0.01", status: "online", accepted: 1 },
    };
  }
}

// Main entry point
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders }, status: 401 }
      );
    }

    console.log('Fetching available cryptocurrencies from CoinPayments');
    
    // Get available currencies
    const currencies = await getAvailableCurrencies();
    
    // Filter to only include non-fiat currencies that are online and accepted
    const filteredCurrencies = Object.entries(currencies)
      .filter(([_, data]: [string, any]) => 
        data.is_fiat === 0 && 
        data.status === "online" && 
        data.accepted === 1)
      .reduce((acc, [code, data]) => {
        acc[code] = data;
        return acc;
      }, {} as Record<string, any>);
      
    console.log(`Returning ${Object.keys(filteredCurrencies).length} available cryptocurrencies`);
    
    return new Response(
      JSON.stringify({ 
        currencies: filteredCurrencies
      }),
      { headers: corsHeaders, status: 200 }
    );
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
