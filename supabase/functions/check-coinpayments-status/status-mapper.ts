
/**
 * Maps CoinPayments transaction status codes to our internal status values
 */
export function mapCoinPaymentsStatus(status: number | string): string {
  // Convert status to number for safer comparison
  const statusNum = typeof status === 'string' ? parseInt(status, 10) : status;
  
  switch (statusNum) {
    case -2:
      return 'refunded'; // PayPal refund or reversed
    case -1:
      return 'cancelled'; // Cancelled / timed out
    case 0:
      return 'pending'; // Waiting for buyer funds
    case 1:
      return 'pending'; // Funds received, waiting for confirmation
    case 2:
      return 'confirmed'; // Confirmed by network but not yet sent
    case 3: 
    case 100: // Status 100 is complete
      return 'completed'; // Completed, funds sent to merchant
    default:
      // If we receive a status code we don't recognize, default to pending
      console.warn(`Unknown CoinPayments status code: ${status}, defaulting to 'pending'`);
      return 'pending';
  }
}

/**
 * Returns a human-readable description of a CoinPayments status code
 */
export function getStatusDescription(status: number | string): string {
  // Convert status to number for safer comparison
  const statusNum = typeof status === 'string' ? parseInt(status, 10) : status;
  
  switch (statusNum) {
    case -2:
      return 'PayPal refund or reversal';
    case -1:
      return 'Cancelled / timed out';
    case 0:
      return 'Waiting for buyer funds';
    case 1:
      return 'Funds received, waiting for confirmations';
    case 2:
      return 'Confirmed by network, waiting to send';
    case 3:
      return 'Payment completed, funds sent to merchant';
    case 100:
      return 'Payment completed (complete)';
    default:
      return `Unknown status code: ${status}`;
  }
}
