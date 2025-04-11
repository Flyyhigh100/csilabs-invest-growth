
// Map CoinPayments numeric status codes to our internal status strings
export function mapCoinPaymentsStatus(statusCode: number): string {
  // CoinPayments Status Codes:
  // -2 = Refunded/Cancelled
  // -1 = Cancelled or Timed Out
  // 0 = Pending
  // 1 = Waiting for confirmation (~10 minutes) - IMPORTANT: This should be COMPLETED!
  // 2+ = Confirmed (# is the number of confirmations)
  // 100+ = Completed (fully confirmed per coin requirements)
  
  if (statusCode < 0) {
    // Any negative status indicates a failed transaction
    return 'failed';
  } else if (statusCode === 0) {
    // Status 0 means pending (not yet detected on blockchain)
    return 'pending';
  } else if (statusCode >= 100 || statusCode >= 1) {
    // Status 100+ means fully confirmed and complete
    // Status 1+ also means payment received and should be completed
    return 'completed';
  } else {
    // Fallback for unexpected status codes
    console.warn(`Unknown CoinPayments status code: ${statusCode}, falling back to 'pending'`);
    return 'pending';
  }
}

// Get a human-readable description for the status
export function getStatusDescription(statusCode: number): string {
  if (statusCode < 0) {
    return statusCode === -1 ? 'Transaction cancelled' : 'Transaction refunded';
  } else if (statusCode === 0) {
    return 'Waiting for payment';
  } else if (statusCode >= 100) {
    return 'Payment complete';
  } else if (statusCode >= 1) {
    return `Confirming payment (${statusCode} confirmations)`;
  } else {
    return 'Unknown status';
  }
}
