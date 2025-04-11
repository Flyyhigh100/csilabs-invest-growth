
// Map CoinPayments status codes to our internal status
export function mapCoinPaymentsStatus(statusCode: number): string {
  // Status codes: https://www.coinpayments.net/merchant-tools-ipn
  // -1 = Error/canceled
  // 0 = Pending
  // 1 = Payment received (partial or complete payment)
  // 2 = Complete (Pay exact confirmed, usually standard) 
  // 3 = Confirmed (3+ confirmations)
  // 100 = Complete/Confirmed
  
  console.log(`IPN webhook mapping status code: ${statusCode}`);
  
  switch (statusCode) {
    case -1:
      return 'failed';
    case 0:
      return 'pending';
    case 1:
      return 'confirmed'; // Payment received but not fully confirmed yet
    case 2:
    case 3:
    case 100:
      return 'completed';
    default:
      console.warn(`Unknown CoinPayments status code: ${statusCode}, defaulting to pending`);
      return 'pending';
  }
}
