
export const userOperations = {
  async getUserDetails({ userId }, adminClient) {
    const { data: userData, error: getUserError } = await adminClient.auth.admin.getUserById(userId);
    
    if (getUserError) {
      throw getUserError;
    }
    
    return { user: userData };
  },
  
  async getAllUsers(adminClient) {
    console.log("Fetching all users for admin...");
    
    try {
      // Get all user profiles
      const { data: profilesData, error: profilesError } = await adminClient
        .from("profiles")
        .select("*");
        
      if (profilesError) {
        console.error("Error fetching user profiles:", profilesError);
        throw new Error(`Failed to fetch user profiles: ${profilesError.message}`);
      }
      
      console.log(`Found ${profilesData?.length || 0} user profiles`);
      
      // Get all KYC verifications to map them to users
      const { data: kycData, error: kycError } = await adminClient
        .from("kyc_verifications")
        .select("*");
        
      if (kycError) {
        console.error("Error fetching KYC verifications:", kycError);
        throw new Error(`Failed to fetch KYC verifications: ${kycError.message}`);
      }
      
      console.log(`Found ${kycData?.length || 0} KYC records`);
      
      // Create a map of user_id to KYC status
      const kycMap = {};
      if (kycData && kycData.length > 0) {
        kycData.forEach(record => {
          kycMap[record.user_id] = {
            status: record.status,
            id: record.id,
            kycComplete: Boolean(
              record.first_name && 
              record.last_name && 
              record.id_front_url && 
              record.id_back_url &&
              record.selfie_url
            )
          };
        });
      }
      
      console.log("KYC map created:", Object.keys(kycMap).length);
      
      // Try to get user emails from auth (may fail if user doesn't have admin permissions)
      let authUsersMap = {};
      try {
        const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();
        
        if (!authError && authUsers) {
          authUsersMap = authUsers.users.reduce((acc, user) => {
            acc[user.id] = user.email;
            return acc;
          }, {});
          console.log("Auth users fetched successfully");
        } else if (authError) {
          console.warn("Could not fetch auth users:", authError);
          // Continue without auth emails
        }
      } catch (authErr) {
        console.warn("Exception fetching auth users:", authErr);
        // Continue without auth emails
      }
      
      // Combine all data into a comprehensive users list
      const usersWithDetails = (profilesData || []).map(profile => {
        const kycInfo = kycMap[profile.id] || { status: 'not_started', kycComplete: false };
        
        return {
          id: profile.id,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: authUsersMap[profile.id] || profile.email || 'N/A',
          wallet_address: profile.wallet_address || 'Not set',
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          kyc_status: kycInfo.status,
          kyc_id: kycInfo.id,
          has_kyc_record: Boolean(kycInfo.id),
          kyc_complete: kycInfo.kycComplete
        };
      });
      
      console.log(`Returning ${usersWithDetails.length} enhanced user records`);
      
      return {
        users: usersWithDetails,
        total: usersWithDetails.length
      };
    } catch (error) {
      console.error("Error in getAllUsers operation:", error);
      throw error;
    }
  }
};
