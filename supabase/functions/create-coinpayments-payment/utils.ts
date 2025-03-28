
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to create HMAC signature
export async function createSignature(params: Record<string, string>, privateKey: string): Promise<string> {
  const payload = new URLSearchParams(params).toString();
  const encoder = new TextEncoder();
  const key = encoder.encode(privateKey);
  const message = encoder.encode(payload);
  
  // Create HMAC using SubtleCrypto API
  const hmacKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "HMAC",
    hmacKey,
    message
  );
  
  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate mock payment data for testing when API fails
export function generateMockPaymentData(amount: string, currencyCode: string = 'USDT'): {
  address: string;
  amount: string;
  txn_id: string;
  timeout: number;
  qrcode_url: string;
  status_url: string;
  currency: string; // Added currency to the return type
} {
  // Generate a semi-realistic mock address based on the currency
  let mockAddress = '';
  const currency = currencyCode.toUpperCase();
  
  switch (currency) {
    case 'BTC':
      // Bitcoin style address
      mockAddress = `bc1${Array.from({length: 38}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      break;
    case 'ETH':
    case 'USDT': // For ERC-20 tokens
      // Ethereum style address
      mockAddress = `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      break;
    case 'DOGE':
      // Dogecoin style address
      mockAddress = `D${Array.from({length: 33}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      break;
    case 'XRP':
      // Ripple style address
      mockAddress = `r${Array.from({length: 24}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      break;
    case 'LTCT':
      // Litecoin testnet style address
      mockAddress = `m${Array.from({length: 33}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      break;
    default:
      // Default to Ethereum style address
      mockAddress = `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
  }
  
  const mockTxnId = `CP${Date.now()}`;
  
  return {
    address: mockAddress,
    amount: amount,
    txn_id: mockTxnId,
    timeout: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    qrcode_url: `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`${currency.toLowerCase()}:${mockAddress}`)}`,
    status_url: `https://www.coinpayments.net/index.php?cmd=status&id=${mockTxnId}`,
    currency: currency // Return the currency in the response
  };
}
