
// Map CoinPayments numeric status codes to our internal status strings
export function mapCoinPaymentsStatus(statusCode: number): string {
  // CoinPayments Status Codes:
  // -2 = Refunded/Cancelled
  // -1 = Cancelled or Timed Out
  // 0 = Pending
  // 1 = Payment received (should be completed)
  // 2+ = Confirmed (# is the number of confirmations)
  // 100+ = Completed (fully confirmed per coin requirements)
  
  if (statusCode < 0) {
    return 'failed';
  } else if (statusCode === 0) {
    return 'pending';
  } else if (statusCode === 1 || statusCode >= 100) {
    return 'completed';
  } else if (statusCode >= 2) {
    return 'completed'; // Any confirmation should mark as completed
  } else {
    console.warn(`Unknown CoinPayments status code: ${statusCode}, falling back to 'pending'`);
    return 'pending';
  }
}

// Get a human-readable description for the status
export function getStatusDescription(statusCode: number): string {
  switch (statusCode) {
    case -2:
      return 'Transaction refunded';
    case -1:
      return 'Transaction cancelled';
    case 0:
      return 'Waiting for payment';
    case 1:
      return 'Payment received';
    case 100:
      return 'Payment complete';
    default:
      return statusCode >= 2 ? `Payment confirmed (${statusCode} confirmations)` : 'Unknown status';
  }
}
