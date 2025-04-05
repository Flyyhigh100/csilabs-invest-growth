
/**
 * Functions to verify KYC existence and current state
 */

/**
 * Checks if a KYC record exists and returns its current state
 */
export async function verifyKycExists(adminClient: any, kycId: string): Promise<any> {
  const { data: currentKyc, error: fetchError } = await adminClient
    .from("kyc_verifications")
    .select("*")
    .eq("id", kycId)
    .single();
  
  if (fetchError) {
    console.error("Error fetching KYC record:", fetchError);
    throw new Error(`Failed to fetch KYC record: ${fetchError.message}`);
  }
  
  if (!currentKyc) {
    throw new Error(`KYC record with ID ${kycId} not found`);
  }
  
  console.log(`Current KYC status before update: ${currentKyc.status}`);
  return currentKyc;
}
