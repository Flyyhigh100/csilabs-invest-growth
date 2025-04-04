
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
    
    // Fetch current KYC record to verify it exists
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
    
    // Get original status for logging
    const originalStatus = currentKyc.status;
    
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
      updateData.clarification_message = rejectionReason;
      updateData.approved_at = null;
      updateData.approved_by = null;
      updateData.rejection_reason = null;
    }
    
    // Log the operation and data for debugging
    console.log(`Admin processing KYC verification: changing status from ${originalStatus} to ${status}`);
    console.log("Update data:", updateData);
    
    // Use the admin client to bypass RLS
    const { data: kycData, error: kycError } = await adminClient
      .from("kyc_verifications")
      .update(updateData)
      .eq("id", kycId)
      .select()
      .single();
    
    if (kycError) {
      console.error("KYC update error:", kycError);
      throw kycError;
    }
    
    console.log(`KYC update successful: changed status from ${originalStatus} to ${status}`);
    return { kyc: kycData, success: true, previousStatus: originalStatus };
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
    
    // First fetch current record to log the status change
    const { data: currentKyc, error: fetchError } = await adminClient
      .from("kyc_verifications")
      .select("*")
      .eq("id", kycId)
      .single();
    
    if (fetchError || !currentKyc) {
      console.error("Error fetching KYC record:", fetchError);
      throw new Error(`Failed to fetch KYC record: ${fetchError?.message || "Record not found"}`);
    }
    
    const originalStatus = currentKyc.status;
    
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
      throw clarifyError;
    }
    
    console.log(`KYC clarification update successful: changed status from ${originalStatus} to needs_clarification`);
    return { kyc: clarifyData, success: true, previousStatus: originalStatus };
  }
};
