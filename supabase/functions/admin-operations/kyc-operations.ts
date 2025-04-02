
export const kycOperations = {
  async processKyc({ kycId, status, rejectionReason }, user, adminClient) {
    console.log(`Admin ${user.id} processing KYC ${kycId} with status ${status}`);
    
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
    } else if (status === "needs_clarification") {
      updateData.clarification_message = rejectionReason;
      updateData.approved_at = null;
      updateData.approved_by = null;
    }
    
    // Log the operation and data for debugging
    console.log("Admin processing KYC verification with update data:", updateData);
    
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
    
    console.log("KYC update successful, returned data:", kycData);
    return { kyc: kycData };
  },
  
  async requestKycClarification({ kycId, message }, adminClient) {
    // Use the admin client to bypass RLS
    const { data: clarifyData, error: clarifyError } = await adminClient
      .from("kyc_verifications")
      .update({
        status: "needs_clarification",
        clarification_message: message,
        reviewed_at: new Date().toISOString(),
        approved_at: null,
        approved_by: null
      })
      .eq("id", kycId)
      .select()
      .single();
    
    if (clarifyError) {
      console.error("KYC clarification update error:", clarifyError);
      throw clarifyError;
    }
    
    console.log("KYC clarification update successful:", clarifyData);
    return { kyc: clarifyData };
  }
};
