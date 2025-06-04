
export const kycOperations = {
  async processKyc({ kycId, status, rejectionReason }, user, adminClient) {
    console.log(`Admin ${user.id} processing KYC ${kycId} with status ${status}`);
    
    // Validate input parameters
    if (!kycId) {
      throw new Error("KYC ID is required");
    }
    
    if (!status || !['approved', 'rejected', 'needs_clarification'].includes(status)) {
      throw new Error("Invalid status. Must be one of: approved, rejected, needs_clarification");
    }
    
    // Validate rejection reason is provided when status is 'rejected'
    if (status === 'rejected' && !rejectionReason) {
      throw new Error("Rejection reason is required when rejecting a KYC verification");
    }
    
    // Double-check admin permissions explicitly with detailed error handling
    try {
      // Special case for chris.d.conley@gmail.com - always grant access
      if (user.email && user.email.toLowerCase() === 'chris.d.conley@gmail.com') {
        console.log("Special admin case: chris.d.conley@gmail.com verified");
      } else {
        const { data: adminCheck, error: adminCheckError } = await adminClient
          .from("admins")
          .select("*")
          .or(`id.eq.${user.id},email.eq.${user.email.toLowerCase()}`)
          .maybeSingle();
        
        if (adminCheckError) {
          console.error("Admin permission verification error:", adminCheckError);
          throw new Error(`Admin permission verification failed: ${adminCheckError.message}`);
        }
        
        if (!adminCheck) {
          console.error("User does not have admin permissions:", user);
          throw new Error("You do not have admin permissions to process KYC verifications");
        }
        
        console.log("Admin permissions explicitly verified:", adminCheck);
      }
    } catch (permError) {
      console.error("Error during admin permission check:", permError);
      throw new Error(`Admin permission check failed: ${permError.message}`);
    }
    
    // Define update data with appropriate type casting for timestamp fields
    const updateData = {
      status,
      reviewed_at: new Date().toISOString(),
    };
    
    if (status === "approved") {
      updateData.approved_at = new Date().toISOString();
      updateData.approved_by = user.id;
      updateData.rejection_reason = null;
      updateData.clarification_message = null;
    } else if (status === "rejected" && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
      updateData.approved_at = null;
      updateData.approved_by = null;
      updateData.clarification_message = null;
    } else if (status === "needs_clarification") {
      updateData.clarification_message = rejectionReason || null;
      updateData.approved_at = null;
      updateData.approved_by = null;
      updateData.rejection_reason = null;
    }
    
    // Log the operation and data for debugging
    console.log("Admin processing KYC verification with update data:", updateData);
    
    try {
      // First, fetch the current KYC record to verify it exists and get user_id
      const { data: currentKyc, error: fetchError } = await adminClient
        .from("kyc_verifications")
        .select("*, profiles!inner(first_name, last_name, email)")
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
      
      // Use the admin client to bypass RLS
      const { data: kycData, error: kycError } = await adminClient
        .from("kyc_verifications")
        .update(updateData)
        .eq("id", kycId)
        .select()
        .single();
      
      if (kycError) {
        console.error("KYC update error:", kycError);
        console.log("Error details:", JSON.stringify(kycError, null, 2));
        throw new Error(`Failed to update KYC: ${kycError.message}`);
      }
      
      if (!kycData) {
        throw new Error("KYC update returned no data");
      }
      
      console.log("KYC update successful, returned data:", kycData);
      
      // Add extra verification steps to ensure update was successful
      const { data: verifyData, error: verifyError } = await adminClient
        .from("kyc_verifications")
        .select("*")
        .eq("id", kycId)
        .single();
        
      if (verifyError) {
        console.error("Error verifying KYC update:", verifyError);
        console.warn("Update may have completed successfully but verification failed");
        throw new Error(`Failed to verify update: ${verifyError.message}`);
      } 
      
      if (!verifyData) {
        console.error(`Could not find KYC record with ID ${kycId} after update`);
        throw new Error(`Could not find KYC record after update`);
      }
      
      console.log(`Verified KYC status after update: ${verifyData.status}`);
      
      // Add additional verification to check if the status actually changed
      if (verifyData.status !== status) {
        console.error(`Status mismatch! Expected ${status} but found ${verifyData.status}`);
        throw new Error(`Status mismatch: Expected ${status} but found ${verifyData.status}`);
      } 
      
      console.log("Status update verified successfully");
      
      // Send email notification after successful KYC update
      try {
        console.log(`Sending email notification for KYC ${kycId} with status ${status}`);
        
        const emailPayload = {
          userId: currentKyc.user_id,
          kycId: kycId,
          status: status,
          rejectionReason: status === 'rejected' ? rejectionReason : undefined,
          clarificationMessage: status === 'needs_clarification' ? rejectionReason : undefined
        };
        
        const { data: emailData, error: emailError } = await adminClient.functions.invoke(
          'send-kyc-notification-email',
          {
            body: emailPayload
          }
        );
        
        if (emailError) {
          console.error("Error sending KYC notification email:", emailError);
          // Don't throw error here - we don't want email failure to break KYC processing
          console.warn("KYC status updated successfully but email notification failed");
        } else {
          console.log("KYC notification email sent successfully:", emailData);
        }
      } catch (emailException) {
        console.error("Exception while sending KYC notification email:", emailException);
        // Log but don't throw - email is supplementary to the main KYC operation
        console.warn("KYC status updated successfully but email notification failed due to exception");
      }
      
      return { kyc: kycData, success: true };
    } catch (error) {
      console.error("Error in KYC update operation:", error);
      console.log("Error details:", JSON.stringify(error, null, 2));
      throw error;
    }
  },
  
  async requestKycClarification({ kycId, message }, user, adminClient) {
    // Validate input parameters
    if (!kycId) {
      throw new Error("KYC ID is required");
    }
    
    if (!message) {
      throw new Error("Clarification message is required");
    }
    
    console.log(`Admin ${user.id} requesting clarification for KYC ${kycId}`);
    
    // Double-check admin permissions explicitly
    try {
      // Special case for chris.d.conley@gmail.com - always grant access
      if (user.email && user.email.toLowerCase() === 'chris.d.conley@gmail.com') {
        console.log("Special admin case: chris.d.conley@gmail.com verified for clarification");
      } else {
        const { data: adminCheck, error: adminCheckError } = await adminClient
          .from("admins")
          .select("*")
          .or(`id.eq.${user.id},email.eq.${user.email.toLowerCase()}`)
          .maybeSingle();
        
        if (adminCheckError) {
          console.error("Admin permission verification error:", adminCheckError);
          throw new Error(`Admin permission verification failed: ${adminCheckError.message}`);
        }
        
        if (!adminCheck) {
          console.error("User does not have admin permissions:", user);
          throw new Error("You do not have admin permissions to request clarification");
        }
        
        console.log("Admin permissions explicitly verified for clarification:", adminCheck);
      }
    } catch (permError) {
      console.error("Error during admin permission check for clarification:", permError);
      throw new Error(`Admin permission check failed: ${permError.message}`);
    }
    
    try {
      // Log current state before update and get user_id
      const { data: beforeKyc, error: beforeError } = await adminClient
        .from("kyc_verifications")
        .select("*, profiles!inner(first_name, last_name, email)")
        .eq("id", kycId)
        .single();
        
      if (beforeError) {
        console.error("Error fetching KYC record before clarification:", beforeError);
        throw new Error(`Failed to fetch KYC record before clarification: ${beforeError.message}`);
      } 
      
      if (!beforeKyc) {
        throw new Error(`KYC record with ID ${kycId} not found`);
      }
      
      console.log(`Current KYC status before clarification request: ${beforeKyc.status}`);
      
      // Use the admin client to bypass RLS
      const { data: clarifyData, error: clarifyError } = await adminClient
        .from("kyc_verifications")
        .update({
          status: "needs_clarification",
          clarification_message: message,
          reviewed_at: new Date().toISOString(),
          approved_at: null,
          approved_by: null,
          rejection_reason: null
        })
        .eq("id", kycId)
        .select()
        .single();
      
      if (clarifyError) {
        console.error("KYC clarification update error:", clarifyError);
        console.log("Error details:", JSON.stringify(clarifyError, null, 2));
        throw new Error(`Failed to update KYC clarification: ${clarifyError.message}`);
      }
      
      if (!clarifyData) {
        throw new Error("KYC clarification update returned no data");
      }
      
      console.log("KYC clarification update successful:", clarifyData);
      
      // Verify the update went through correctly
      const { data: verifyData, error: verifyError } = await adminClient
        .from("kyc_verifications")
        .select("*")
        .eq("id", kycId)
        .single();
        
      if (verifyError) {
        console.error("Error verifying clarification update:", verifyError);
        throw new Error(`Failed to verify clarification update: ${verifyError.message}`);
      } 
      
      if (!verifyData) {
        throw new Error(`KYC record with ID ${kycId} not found after update`);
      }
      
      console.log(`Verified KYC status after clarification request: ${verifyData.status}`);
      console.log(`Clarification message set to: ${verifyData.clarification_message}`);
      
      // Add additional verification to check if the status actually changed
      if (verifyData.status !== "needs_clarification") {
        console.error(`Status mismatch! Expected needs_clarification but found ${verifyData.status}`);
        throw new Error(`Status mismatch: Expected needs_clarification but found ${verifyData.status}`);
      } 
      
      console.log("Status update to needs_clarification verified successfully");
      
      // Send email notification for clarification request
      try {
        console.log(`Sending clarification email notification for KYC ${kycId}`);
        
        const emailPayload = {
          userId: beforeKyc.user_id,
          kycId: kycId,
          status: 'needs_clarification',
          clarificationMessage: message
        };
        
        const { data: emailData, error: emailError } = await adminClient.functions.invoke(
          'send-kyc-notification-email',
          {
            body: emailPayload
          }
        );
        
        if (emailError) {
          console.error("Error sending clarification notification email:", emailError);
          console.warn("KYC clarification updated successfully but email notification failed");
        } else {
          console.log("Clarification notification email sent successfully:", emailData);
        }
      } catch (emailException) {
        console.error("Exception while sending clarification notification email:", emailException);
        console.warn("KYC clarification updated successfully but email notification failed due to exception");
      }
      
      return { kyc: clarifyData, success: true };
    } catch (error) {
      console.error("Error in KYC clarification operation:", error);
      console.log("Error details:", JSON.stringify(error, null, 2));
      throw error;
    }
  }
};
