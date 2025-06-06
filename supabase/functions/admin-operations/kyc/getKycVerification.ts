
/**
 * Get KYC verification by ID
 */
export async function getKycVerification(kycId: string, adminClient: any) {
  console.log(`🔍 Getting KYC verification: ${kycId}`);
  
  if (!kycId) {
    throw new Error('KYC ID is required');
  }
  
  try {
    const { data, error } = await adminClient
      .from('kyc_verifications')
      .select(`
        *,
        profiles!inner(
          id,
          first_name,
          last_name,
          email,
          phone_number,
          street_address,
          city,
          state_province,
          postal_code
        )
      `)
      .eq('id', kycId)
      .single();
    
    if (error) {
      console.error('Error fetching KYC verification:', error);
      throw new Error(`Failed to fetch KYC verification: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('KYC verification not found');
    }
    
    console.log(`✅ Successfully retrieved KYC verification: ${kycId}`);
    return { kyc: data };
    
  } catch (error) {
    console.error(`❌ Error in getKycVerification for ${kycId}:`, error);
    throw error;
  }
}
