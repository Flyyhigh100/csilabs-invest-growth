
/**
 * Get all KYC verifications
 */
export async function getKycVerifications(adminClient: any) {
  console.log('🔍 Getting all KYC verifications');
  
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
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching KYC verifications:', error);
      throw new Error(`Failed to fetch KYC verifications: ${error.message}`);
    }
    
    console.log(`✅ Successfully retrieved ${data?.length || 0} KYC verifications`);
    return { verifications: data || [] };
    
  } catch (error) {
    console.error('❌ Error in getKycVerifications:', error);
    throw error;
  }
}
