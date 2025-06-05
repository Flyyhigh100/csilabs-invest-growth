
export const userOperations = {
  async getUserDetails({ userId }, adminClient) {
    const { data: userData, error: getUserError } = await adminClient.auth.admin.getUserById(userId);
    
    if (getUserError) {
      throw getUserError;
    }
    
    return { user: userData };
  },
  
  async getAllUsers(_, adminClient) {
    console.log("Fetching all users for admin with enhanced auth data...");
    
    try {
      // Get all user profiles using the admin client
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
      
      // Get enhanced auth data from auth.users table
      let authUsersMap = {};
      let enhancedAuthData = {};
      
      try {
        const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();
        
        if (!authError && authUsers) {
          authUsersMap = authUsers.users.reduce((acc, user) => {
            acc[user.id] = user.email;
            return acc;
          }, {});
          
          // Create enhanced auth data map with authentication details
          enhancedAuthData = authUsers.users.reduce((acc, user) => {
            // Determine authentication method based on user data
            const hasPassword = user.encrypted_password ? true : false;
            const hasMagicLink = user.app_metadata?.provider === 'email' && !hasPassword;
            
            // Determine signup method
            let signupMethod = 'Unknown';
            if (user.app_metadata?.provider) {
              signupMethod = user.app_metadata.provider === 'email' ? 
                (hasPassword ? 'Email/Password' : 'Magic Link') : 
                user.app_metadata.provider;
            }
            
            acc[user.id] = {
              email_confirmed_at: user.email_confirmed_at,
              confirmed_at: user.confirmed_at,
              last_sign_in_at: user.last_sign_in_at,
              auth_created_at: user.created_at,
              phone_confirmed_at: user.phone_confirmed_at,
              email_confirmed: Boolean(user.email_confirmed_at),
              auth_method: hasPassword ? 'Email/Password' : 'Magic Link',
              signup_method: signupMethod,
              is_anonymous: user.is_anonymous || false,
              providers: user.identities?.map(identity => identity.provider) || []
            };
            
            return acc;
          }, {});
          
          console.log("Enhanced auth data fetched successfully for", Object.keys(enhancedAuthData).length, "users");
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
        const authInfo = enhancedAuthData[profile.id] || {};
        
        return {
          id: profile.id,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: authUsersMap[profile.id] || profile.email || 'N/A',
          wallet_address: profile.wallet_address || null,
          solana_wallet_address: profile.solana_wallet_address || null,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          kyc_status: kycInfo.status,
          kyc_id: kycInfo.id,
          has_kyc_record: Boolean(kycInfo.id),
          kyc_complete: kycInfo.kycComplete,
          // Enhanced authentication data
          email_confirmed_at: authInfo.email_confirmed_at,
          confirmed_at: authInfo.confirmed_at,
          last_sign_in_at: authInfo.last_sign_in_at,
          auth_created_at: authInfo.auth_created_at,
          phone_confirmed_at: authInfo.phone_confirmed_at,
          email_confirmed: authInfo.email_confirmed || false,
          auth_method: authInfo.auth_method || 'Unknown',
          signup_method: authInfo.signup_method || 'Unknown',
          is_anonymous: authInfo.is_anonymous || false,
          providers: authInfo.providers || []
        };
      });
      
      console.log(`Returning ${usersWithDetails.length} enhanced user records with auth data`);
      
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
