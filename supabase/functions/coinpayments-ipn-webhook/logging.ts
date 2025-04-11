
// Log IPN data to a dedicated log table for debugging
export async function logIpnData(
  client: any, 
  ipnData: any, 
  isValid: boolean, 
  responseStatus: string,
  hmacHeader?: string,
  requestBody?: string
) {
  try {
    const { error } = await client
      .from('ipn_logs')
      .insert({
        provider: 'coinpayments',
        raw_data: ipnData,
        is_valid: isValid,
        response_status: responseStatus,
        txn_id: ipnData.txn_id || null,
        status: ipnData.status || null,
        hmac_header: hmacHeader || null,
        request_body: requestBody || null
      });
      
    if (error) {
      console.error('Error logging IPN data:', error);
    }
  } catch (error) {
    console.error('Error in logIpnData:', error);
  }
}
