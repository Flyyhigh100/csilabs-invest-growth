
export const userAuthOperations = {
  async getUserAuthDetails({ userId }, adminClient) {
    console.log(`Fetching detailed auth data for user: ${userId}`);
    
    try {
      // Get user profile data
      const { data: profile, error: profileError } = await adminClient
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
        
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw new Error(`Failed to fetch user profile: ${profileError.message}`);
      }
      
      // Get detailed auth data from auth.users
      const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(userId);
      
      if (authError) {
        console.error("Error fetching auth user:", authError);
        throw new Error(`Failed to fetch auth user: ${authError.message}`);
      }
      
      // Get KYC data if exists
      const { data: kycData, error: kycError } = await adminClient
        .from("kyc_verifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);
        
      if (kycError) {
        console.warn("Error fetching KYC data:", kycError);
      }
      
      // Get recent transactions for context
      const { data: recentTransactions, error: txError } = await adminClient
        .from("transactions")
        .select("id, status, created_at, amount, payment_method")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
        
      if (txError) {
        console.warn("Error fetching recent transactions:", txError);
      }
      
      // Process authentication details
      const user = authUser.user;
      const hasPassword = user.encrypted_password ? true : false;
      const hasMagicLink = user.app_metadata?.provider === 'email' && !hasPassword;
      
      // Determine signup method
      let signupMethod = 'Unknown';
      if (user.app_metadata?.provider) {
        signupMethod = user.app_metadata.provider === 'email' ? 
          (hasPassword ? 'Email/Password' : 'Magic Link') : 
          user.app_metadata.provider;
      }
      
      // Calculate account age
      const accountAge = user.created_at ? 
        Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 
        null;
      
      // Determine login activity status
      let loginStatus = 'never-logged-in';
      let daysSinceLogin = null;
      
      if (user.last_sign_in_at) {
        const lastLogin = new Date(user.last_sign_in_at);
        const now = new Date();
        daysSinceLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLogin <= 7) {
          loginStatus = 'active';
        } else if (daysSinceLogin <= 30) {
          loginStatus = 'occasional';
        } else {
          loginStatus = 'inactive';
        }
      }
      
      const authDetails = {
        // Basic user info
        userId: user.id,
        email: user.email,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        
        // Email verification
        emailConfirmed: Boolean(user.email_confirmed_at),
        emailConfirmedAt: user.email_confirmed_at,
        confirmationSentAt: user.confirmation_sent_at,
        
        // Authentication method
        authMethod: hasPassword ? 'Email/Password' : 'Magic Link',
        signupMethod: signupMethod,
        hasPassword: hasPassword,
        
        // Login activity
        loginStatus: loginStatus,
        lastSignInAt: user.last_sign_in_at,
        daysSinceLogin: daysSinceLogin,
        
        // Account timeline
        createdAt: user.created_at,
        accountAge: accountAge,
        confirmedAt: user.confirmed_at,
        
        // Additional auth data
        phoneConfirmedAt: user.phone_confirmed_at,
        isAnonymous: user.is_anonymous || false,
        providers: user.identities?.map(identity => identity.provider) || [],
        
        // Profile data
        walletAddress: profile?.wallet_address,
        preferredNetwork: profile?.preferred_network,
        
        // KYC status
        kycStatus: kycData?.[0]?.status || 'not_started',
        kycSubmittedAt: kycData?.[0]?.submitted_at,
        
        // Recent activity context
        recentTransactions: recentTransactions || [],
        totalTransactions: recentTransactions?.length || 0
      };
      
      console.log(`Successfully fetched auth details for user ${userId}`);
      
      return {
        authDetails,
        success: true
      };
      
    } catch (error) {
      console.error("Error in getUserAuthDetails operation:", error);
      throw error;
    }
  }
};
