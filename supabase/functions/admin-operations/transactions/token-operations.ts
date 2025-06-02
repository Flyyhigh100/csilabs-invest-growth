
// Functions related to token sending and marking tokens as sent
export const markTokensSent = async ({ transactionId, blockchainTxId, tokenAmount, tokenPrice }, adminClient) => {
  console.log(`Marking transaction ${transactionId} as sent with blockchain TX: ${blockchainTxId}`);
  console.log(`Token amount: ${tokenAmount}, Token price: ${tokenPrice}`);
  
  if (!transactionId || !blockchainTxId) {
    console.error("Missing required parameters for markTokensSent");
    throw new Error("Transaction ID and blockchain transaction ID are required");
  }
  
  try {
    // Prepare update data
    const updateData = {
      token_sent: true,
      blockchain_tx_id: blockchainTxId,
      updated_at: new Date().toISOString(),
    };

    // Add token amount and price if provided
    if (tokenAmount && tokenAmount > 0) {
      updateData.token_amount = tokenAmount;
    }
    
    if (tokenPrice && tokenPrice > 0) {
      updateData.token_price = tokenPrice;
    }

    console.log("Updating transaction with data:", updateData);

    // Use the admin client to bypass RLS
    const { data: txData, error: txError } = await adminClient
      .from("transactions")
      .update(updateData)
      .eq("id", transactionId)
      .select()
      .single();
    
    if (txError) {
      console.error("Error updating transaction:", txError);
      throw txError;
    }
    
    console.log("Transaction updated successfully:", txData);

    // Create enhanced notification for the user about the token transfer
    if (txData) {
      await createTokenDeliveryNotification(adminClient, txData, blockchainTxId);
      
      // Send email notification to the user with enhanced error handling
      await sendTokenDistributionEmail(adminClient, txData, blockchainTxId);
    }
    
    console.log("Successfully marked transaction as sent:", txData?.id);
    
    return { transaction: txData };
  } catch (error) {
    console.error("Exception in markTokensSent:", error);
    throw error;
  }
};

// Enhanced token delivery notification function
async function createTokenDeliveryNotification(adminClient, transaction, blockchainTxId) {
  try {
    // Calculate token amount if available (with fallback logic)
    const tokenAmount = transaction.token_amount || 
      (transaction.token_price && transaction.token_price > 0 ? 
        transaction.amount / transaction.token_price : null);
    
    // Format token amount for the message
    const tokenText = tokenAmount && tokenAmount > 0
      ? `${Number(tokenAmount).toLocaleString()} CSL tokens`
      : "your CSL tokens";
    
    // Determine blockchain explorer link
    const isSolana = blockchainTxId.includes('solana') || 
                    transaction.payment_method?.toLowerCase().includes('solana');
    
    const explorerUrl = isSolana 
      ? `https://solscan.io/tx/${blockchainTxId}`
      : `https://polygonscan.com/tx/${blockchainTxId}`;
    
    const explorerName = isSolana ? 'Solscan' : 'PolygonScan';
    const txIdDisplay = blockchainTxId.length > 20 
      ? blockchainTxId.slice(0, 8) + '...' + blockchainTxId.slice(-6)
      : blockchainTxId;
    
    const { error: notificationError } = await adminClient
      .from("notifications")
      .insert({
        user_id: transaction.user_id,
        type: "tokens",
        title: "CSL Tokens Delivered Successfully",
        message: `🎉 ${tokenText} have been successfully sent to your wallet (${transaction.wallet_address?.slice(0, 6)}...${transaction.wallet_address?.slice(-4)}). Transaction ID: ${txIdDisplay}. You can verify the transaction on ${explorerName}.`,
        read: false,
        is_test: transaction.is_test || false
      });
      
    if (notificationError) {
      console.error("Error creating token delivery notification:", notificationError);
    } else {
      console.log(`Successfully created token delivery notification for user ${transaction.user_id}`);
    }
  } catch (error) {
    console.error("Error in createTokenDeliveryNotification:", error);
  }
}

// Enhanced function to send email notification to user
async function sendTokenDistributionEmail(adminClient, transaction, blockchainTxId) {
  try {
    console.log(`=== STARTING EMAIL PROCESS for transaction ${transaction.id} ===`);
    
    // Get user profile information for email with enhanced logging
    console.log(`Fetching profile for user_id: ${transaction.user_id}`);
    
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", transaction.user_id)
      .single();
    
    if (profileError) {
      console.error("❌ ERROR fetching user profile:", profileError);
      console.error("Profile fetch failed for user_id:", transaction.user_id);
      return;
    }
    
    if (!profile) {
      console.error("❌ ERROR: No profile found for user_id:", transaction.user_id);
      return;
    }
    
    console.log("✅ Profile fetched successfully:");
    console.log(`- User ID: ${transaction.user_id}`);
    console.log(`- Email: ${profile.email || 'NOT SET'}`);
    console.log(`- Name: ${profile.first_name || 'N/A'} ${profile.last_name || 'N/A'}`);
    
    if (!profile.email) {
      console.error("❌ CRITICAL: User profile exists but email is missing/null");
      console.error("This should have been fixed by the recent migration. Check if migration ran correctly.");
      
      // Let's try to get the email directly from auth.users as a fallback
      console.log("🔄 Attempting fallback: fetching email from auth.users table...");
      
      try {
        const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(transaction.user_id);
        
        if (authError) {
          console.error("❌ Failed to fetch user from auth.users:", authError);
          return;
        }
        
        if (authUser?.user?.email) {
          console.log(`✅ Found email in auth.users: ${authUser.user.email}`);
          
          // Update the profile with the missing email
          const { error: updateError } = await adminClient
            .from("profiles")
            .update({ email: authUser.user.email })
            .eq("id", transaction.user_id);
            
          if (updateError) {
            console.error("❌ Failed to update profile with email:", updateError);
          } else {
            console.log("✅ Successfully updated profile with email from auth.users");
            profile.email = authUser.user.email; // Use for this request
          }
        } else {
          console.error("❌ Email not found in auth.users either");
          return;
        }
      } catch (fallbackError) {
        console.error("❌ Fallback email fetch failed:", fallbackError);
        return;
      }
    }
    
    // Calculate token amount with enhanced logic
    const tokenAmount = transaction.token_amount || 
      (transaction.token_price && transaction.token_price > 0 ? 
        transaction.amount / transaction.token_price : 0);
    
    console.log(`📊 Transaction details:`);
    console.log(`- Token amount: ${tokenAmount}`);
    console.log(`- Purchase amount: $${transaction.amount}`);
    console.log(`- Token price: $${transaction.token_price || 'N/A'}`);
    console.log(`- Wallet: ${transaction.wallet_address}`);
    console.log(`- Blockchain TX: ${blockchainTxId}`);
    console.log(`- Is test: ${transaction.is_test || false}`);
    
    // Prepare email data with improved validation
    const emailData = {
      userEmail: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      tokenAmount: Number(tokenAmount) || 0, // Ensure it's always a number
      walletAddress: transaction.wallet_address,
      blockchainTxId: blockchainTxId,
      transactionAmount: Number(transaction.amount),
      tokenPrice: transaction.token_price ? Number(transaction.token_price) : undefined,
      isTestData: transaction.is_test || false
    };
    
    console.log("📧 Calling send-token-distribution-email function with direct HTTP call:");
    console.log(JSON.stringify(emailData, null, 2));
    
    // Get the Supabase URL for direct HTTP call
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
      return;
    }
    
    // Make direct HTTP call to the email function
    const emailFunctionUrl = `${supabaseUrl}/functions/v1/send-token-distribution-email`;
    
    console.log(`🌐 Making direct HTTP call to: ${emailFunctionUrl}`);
    
    const response = await fetch(emailFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify(emailData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ ERROR calling send-token-distribution-email function via HTTP:");
      console.error(`Status: ${response.status} ${response.statusText}`);
      console.error("Response:", errorText);
      return;
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log("✅ SUCCESS: send-token-distribution-email function called successfully via HTTP");
      console.log("Response data:", data);
    } else {
      console.error("❌ ERROR: Email function returned unsuccessful response:");
      console.error("Response data:", data);
    }
    
    console.log(`=== EMAIL PROCESS COMPLETED for transaction ${transaction.id} ===`);
    
  } catch (error) {
    console.error("❌ EXCEPTION in sendTokenDistributionEmail:");
    console.error("Error:", error);
    console.error("Stack:", error.stack);
    // Don't throw error here - email failure shouldn't affect token marking
  }
}
