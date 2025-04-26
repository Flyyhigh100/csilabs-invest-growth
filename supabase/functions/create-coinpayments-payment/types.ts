
/**
 * Interface for a CoinPayments transaction response
 */
export interface CoinPaymentsTransaction {
  amount: string;         // The amount in cryptocurrency
  txn_id: string;         // CoinPayments transaction ID
  address: string;        // Payment address
  confirms_needed: string; // Confirmations needed
  timeout: number;        // Timeout in seconds
  checkout_url: string;   // Checkout URL
  status_url: string;     // Status URL
  qrcode_url: string;     // QR code URL
  currency: string;       // Currency code
}
