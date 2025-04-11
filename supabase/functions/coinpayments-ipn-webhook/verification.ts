
// Verify the HMAC signature from a CoinPayments IPN request
export async function verifyIpnHmac(request: Request, ipnSecret: string): Promise<boolean> {
  try {
    // Clone the request so we can use its body multiple times
    const clonedRequest = request.clone();
    
    // Get the HMAC header from the request
    const hmacHeader = request.headers.get('HMAC');
    if (!hmacHeader) {
      console.error('No HMAC header found in IPN request');
      return false;
    }
    
    console.log('HMAC header from CoinPayments:', hmacHeader.substring(0, 10) + '...');
    
    // Get the raw body from the request to compute the HMAC
    const rawBody = await clonedRequest.text();
    console.log('Raw IPN request body length:', rawBody.length, 'bytes');
    console.log('Raw IPN request body preview:', rawBody.substring(0, 100) + '...');
    
    // Create HMAC from the request body using the IPN secret
    const encoder = new TextEncoder();
    const messageBuffer = encoder.encode(rawBody);
    
    // Import the IPN secret as a key
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(ipnSecret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    
    // Generate the HMAC signature
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      messageBuffer
    );
    
    // Convert to hex
    const computedHmac = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    console.log('Computed HMAC:', computedHmac.substring(0, 10) + '...');
    
    // Compare the computed HMAC with the one from the header
    const isValid = hmacHeader.toLowerCase() === computedHmac.toLowerCase();
    
    if (!isValid) {
      console.error('HMAC verification failed. Computed HMAC does not match the header');
      console.log('HMAC Header: ', hmacHeader.substring(0, 20) + '...');
      console.log('Computed:    ', computedHmac.substring(0, 20) + '...');
    } else {
      console.log('HMAC verification successful');
    }
    
    return isValid;
  } catch (error) {
    console.error('Error verifying HMAC signature:', error);
    return false;
  }
}
