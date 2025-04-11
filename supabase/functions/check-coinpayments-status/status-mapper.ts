
// Map CoinPayments status codes to our internal status
export function mapCoinPaymentsStatus(
  currentStatus: string, 
  paymentStatus: { status: number, status_text?: string }
): { newStatus: string, updated: boolean } {
  // Status codes: https://www.coinpayments.net/merchant-tools-ipn
  // -1 = Error/canceled
  // 0 = Pending
  // 1 = Partial payment received
  // 2 = Complete
  // 3 = Confirmed (3+ confirmations)
  // 100 = Complete/Confirmed
  
  let newStatus = currentStatus;
  let updated = false;
  
  if (paymentStatus.status < 0) {
    newStatus = 'failed';
    updated = newStatus !== currentStatus;
  } else if (paymentStatus.status === 0) {
    newStatus = 'pending';
    // Only mark as updated if current status isn't already pending
    updated = currentStatus !== 'pending';
  } else if (paymentStatus.status === 1) {
    // Status 1 means we received a payment, but it's not fully confirmed yet
    newStatus = 'confirmed';
    updated = newStatus !== currentStatus;
  } else if (paymentStatus.status >= 2) {
    // All values >= 2 should be considered fully completed
    newStatus = 'completed';
    updated = newStatus !== currentStatus;
  }
  
  return { newStatus, updated };
}
