
/**
 * Utility functions for admin authentication verification
 */

/**
 * Verifies the user has admin permissions
 * @returns true if verification passes, throws error otherwise
 */
export async function verifyAdminPermissions(user: any, adminClient: any): Promise<boolean> {
  // Special case for chris.d.conley@gmail.com - always grant access
  if (user.email && user.email.toLowerCase() === 'chris.d.conley@gmail.com') {
    console.log("Special admin case: chris.d.conley@gmail.com verified");
    return true;
  } 
  
  try {
    const { data: adminCheck, error: adminCheckError } = await adminClient
      .from("admins")
      .select("*")
      .or(`id.eq.${user.id},email.ilike.${user.email.toLowerCase()}`)
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
    return true;
  } catch (permError) {
    console.error("Error during admin permission check:", permError);
    throw new Error(`Admin permission check failed: ${permError.message}`);
  }
}

/**
 * Verifies database access
 * Used for diagnostic purposes
 */
export async function verifyDatabaseAccess(adminClient: any): Promise<void> {
  try {
    const { count, error: accessError } = await adminClient
      .from("kyc_verifications")
      .select("*", { count: "exact", head: true });
      
    if (accessError) {
      console.error("Database access verification error:", accessError);
      throw new Error(`Database access verification failed: ${accessError.message}`);
    }
    
    console.log(`Database access verified. Found ${count} KYC records.`);
  } catch (accessErr) {
    console.error("Error verifying database access:", accessErr);
    // Continue anyway as this is just a diagnostic step
    console.log("Continuing despite access verification error");
  }
}
