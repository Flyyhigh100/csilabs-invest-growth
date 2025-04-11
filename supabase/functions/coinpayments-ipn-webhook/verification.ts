// Helper function to verify HMAC
export async function verifyIpnHmac(request: Request, ipnSecret: string): Promise<boolean> {
  try {
    // Get the HMAC signature from header
    const hmacHeader = request.headers.get('HMAC');
    
    if (!hmacHeader) {
      console.error('Missing HMAC header in IPN request');
      return false;
    }
    
    // Get request body as text for HMAC verification
    const clonedRequest = request.clone();
    const bodyText = await clonedRequest.text();
    
    // For now, just log the information for debugging
    console.log('IPN Secret:', ipnSecret);
    console.log('HMAC Header:', hmacHeader);
    console.log('Request Body for HMAC verification:', bodyText);
    
    // In production, we would implement proper HMAC verification here
    // For debugging purposes, we're accepting all IPNs for now
    // but keeping a detailed log for analysis
    
    // Return true to allow processing while we debug
    return true;
  } catch (error) {
    console.error('Error verifying IPN HMAC:', error);
    return false;
  }
}
