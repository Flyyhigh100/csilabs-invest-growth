
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

// CORS headers for browser requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

// Helper function to create HMAC signature
export async function createSignature(params: Record<string, string>, privateKey: string): Promise<string> {
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

// Generate mock payment data with proper currency conversion simulation
export function generateMockPaymentData(amount: string, currencyCode: string = 'USDT'): any {
  // FIXED: More realistic conversion rates for demonstration purposes
  // These rates represent the approximate INVERSE of USD value (USD per crypto unit)
  // meaning how many USD = 1 unit of cryptocurrency
  const mockExchangeRates = {
    BTC: 45000,    // 1 BTC ≈ $45,000
    ETH: 3500,     // 1 ETH ≈ $3,500
    USDT: 1.0,     // 1:1 with USD
    USDC: 1.0,     // 1:1 with USD
    BNB: 425,      // 1 BNB ≈ $425
    LTC: 92,       // 1 LTC ≈ $92
    DOGE: 0.115,   // 1 DOGE ≈ $0.115
    XRP: 0.71,     // 1 XRP ≈ $0.71
    LTCT: 92,      // Same as LTC for testing
  };
  
  // FIXED: Convert USD amount to cryptocurrency amount properly
  // Amount in USD / Exchange Rate = Amount in cryptocurrency
  const usdAmount = parseFloat(amount);
  const cryptoRate = mockExchangeRates[currencyCode as keyof typeof mockExchangeRates] || 1.0;
  
  // The formula is: USD amount / USD per crypto unit = crypto amount
  // For example: $100 / $45000 per BTC = 0.00222... BTC
  const cryptoAmount = (usdAmount / cryptoRate).toFixed(8);
  
  console.log(`Converting $${usdAmount} to ${currencyCode} using rate 1 ${currencyCode} = $${cryptoRate}`);
  console.log(`Result: ${cryptoAmount} ${currencyCode}`);
  
  // Generate a clean wallet address without currency prefixes for the QR code
  // We use the format expected by most QR scanners: just the address
  const mockAddress = `0x${Array.from({length: 40}, () => 
    Math.floor(Math.random() * 16).toString(16)).join('')}`;
  
  // Generate QR code URL with CLEAN address (without currency prefix)
  // This ensures compatibility with wallet apps
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(mockAddress)}`;
  
  return {
    address: mockAddress, // Clean address without prefix
    amount: cryptoAmount, // Correctly converted crypto amount using exchange rates
    txn_id: `CP${Date.now()}`,
    timeout: Math.floor(Date.now() / 1000) + 3600,
    qrcode_url: qrCodeUrl,
    status_url: `https://www.coinpayments.net/index.php?cmd=status&id=CP${Date.now()}`,
    currency: currencyCode,
    // Add estimated USD value for clarity
    usd_value: amount
  };
}
