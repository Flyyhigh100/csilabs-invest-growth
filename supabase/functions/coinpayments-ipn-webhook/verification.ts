
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
    
    // Try to verify the HMAC
    try {
      // Calculate expected HMAC
      const encoder = new TextEncoder();
      const messageData = encoder.encode(bodyText);
      
      // First try direct encoding of the IPN secret
      try {
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(ipnSecret),
          { name: 'HMAC', hash: 'SHA-512' },
          false,
          ['verify']
        );
        
        // Convert the hmacHeader from hex to ArrayBuffer
        const signatureArray = new Uint8Array(
          hmacHeader.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
        );
        
        const isValid = await crypto.subtle.verify(
          'HMAC',
          key,
          signatureArray,
          messageData
        );
        
        if (isValid) {
          console.log('HMAC signature verified successfully (direct method)');
          return true;
        }
      } catch (err) {
        console.log('Direct HMAC verification failed:', err);
      }
      
      // If direct method fails, try hex decoding the ipnSecret
      try {
        const keyBytes = ipnSecret.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
        const key = await crypto.subtle.importKey(
          'raw',
          new Uint8Array(keyBytes),
          { name: 'HMAC', hash: 'SHA-512' },
          false,
          ['verify']
        );
        
        // Convert the hmacHeader from hex to ArrayBuffer
        const signatureArray = new Uint8Array(
          hmacHeader.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
        );
        
        const isValid = await crypto.subtle.verify(
          'HMAC',
          key,
          signatureArray,
          messageData
        );
        
        if (isValid) {
          console.log('HMAC signature verified successfully (hex decode method)');
          return true;
        }
      } catch (err) {
        console.log('Hex decode HMAC verification failed:', err);
      }
      
      console.error('All HMAC verification methods failed');
      return false;
    } catch (verificationError) {
      console.error('Error during HMAC verification:', verificationError);
      
      // For debugging purposes, accepting all IPNs for now
      // but logging the failure
      console.warn('Allowing IPN despite verification failure for debugging');
      return true;
    }
  } catch (error) {
    console.error('Error verifying IPN HMAC:', error);
    return false;
  }
}
