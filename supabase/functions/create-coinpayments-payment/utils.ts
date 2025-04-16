
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
  // Mock conversion rates for demonstration purposes
  // In a real scenario, these would come from the API
  const mockRates = {
    BTC: 0.000022,  // 1 USD ≈ 0.000022 BTC
    ETH: 0.000271,  // 1 USD ≈ 0.000271 ETH
    USDT: 1.0,      // 1:1 with USD
    USDC: 1.0,      // 1:1 with USD
    BNB: 0.0023,    // 1 USD ≈ 0.0023 BNB
    LTC: 0.0108,    // 1 USD ≈ 0.0108 LTC
    DOGE: 8.71,     // 1 USD ≈ 8.71 DOGE
    XRP: 1.40,      // 1 USD ≈ 1.40 XRP
    LTCT: 0.0108,   // Same as LTC for testing
  };
  
  // Convert USD amount to cryptocurrency amount
  const rate = mockRates[currencyCode as keyof typeof mockRates] || 1.0;
  const cryptoAmount = (parseFloat(amount) * rate).toFixed(8);
  
  // Generate a clean wallet address without currency prefixes for the QR code
  // We use the format expected by most QR scanners: just the address
  const mockAddress = `0x${Array.from({length: 40}, () => 
    Math.floor(Math.random() * 16).toString(16)).join('')}`;
  
  // Generate QR code URL with CLEAN address (without currency prefix)
  // This ensures compatibility with wallet apps
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(mockAddress)}`;
  
  return {
    address: mockAddress, // Clean address without prefix
    amount: cryptoAmount, // Converted crypto amount (not 1:1 with USD)
    txn_id: `CP${Date.now()}`,
    timeout: Math.floor(Date.now() / 1000) + 3600,
    qrcode_url: qrCodeUrl,
    status_url: `https://www.coinpayments.net/index.php?cmd=status&id=CP${Date.now()}`,
    currency: currencyCode,
    // Add estimated USD value for clarity
    usd_value: amount
  };
}
