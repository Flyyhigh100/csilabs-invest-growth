
/**
 * Maps CoinPayments status codes to our application status values
 */
export function mapCoinPaymentsStatus(statusCode: number): string {
  if (statusCode === 100 || statusCode === 2) {
    // 100 = Complete, 2 = Confirmed
    return 'completed';
  } else if (statusCode === 1) {
    // 1 = Pending
    return 'confirmed'; 
  } else if (statusCode < 0) {
    // Negative values = Error/canceled
    return 'failed';
  } else {
    // Default to pending for any other status
    return 'pending';
  }
}

/**
 * Gets a user-friendly description for a status code
 */
export function getStatusDescription(statusCode: number): string {
  switch (statusCode) {
    case -1:
      return 'Cancelled / Timed Out';
    case 0:
      return 'Waiting for buyer funds';
    case 1:
      return 'Funds received and confirmed, sending to you shortly';
    case 2:
      return 'Funds confirmed, processing payment';
    case 100:
      return 'Payment complete';
    default:
      return `Status code: ${statusCode}`;
  }
}
