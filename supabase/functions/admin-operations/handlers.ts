
import { kycOperations } from "./kyc-operations.ts";
import { transactionOperations } from "./transaction-operations.ts";
import { userOperations } from "./user-operations.ts";

export async function handleAdminOperations(action, data, user, adminClient) {
  console.log(`Processing admin operation: ${action}`, data);
  
  try {
    // First verify basic parameters
    if (!action) {
      throw new Error("Action parameter is required");
    }
    
    if (!data) {
      throw new Error("Data parameter is required");
    }
    
    if (!user || !user.id) {
      throw new Error("User authentication required");
    }
    
    if (!adminClient) {
      throw new Error("Admin client is required");
    }
    
    console.log(`User ${user.id} (${user.email}) attempting admin operation: ${action}`);
    
    // Verify admin permissions explicitly first for all operations with improved checking
    console.log("Verifying admin permissions...");
    
    // Special case for chris.d.conley@gmail.com - immediate admin access
    if (user.email && user.email.toLowerCase() === 'chris.d.conley@gmail.com') {
      console.log("User is chris.d.conley@gmail.com - admin access granted automatically");
      
      // Ensure this user exists in the admins table
      try {
        // Check if admin record exists first
        const { data: adminExists, error: checkError } = await adminClient
          .from("admins")
          .select("id")
          .eq("email", user.email.toLowerCase())
          .maybeSingle();
          
        if (checkError) {
          console.log("Error checking admin record:", checkError);
        }
        
        // Add or update admin record if needed
        if (!adminExists) {
          console.log("Adding admin record for chris.d.conley@gmail.com");
          const { error: insertError } = await adminClient
            .from("admins")
            .upsert([{ id: user.id, email: user.email.toLowerCase() }]);
            
          if (insertError) {
            console.log("Error upserting admin record:", insertError);
            // Continue anyway - this is just a courtesy update
          }
        }
      } catch (error) {
        console.log("Error processing special admin case:", error);
        // Continue anyway - this is just a courtesy update
      }
    } else {
      // Regular admin permission check for other users
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
        throw new Error("You do not have admin permissions to perform this operation");
      }
      
      console.log("Admin permissions explicitly verified:", adminCheck);
    }
    
    // Process different admin actions
    switch (action) {
      case "getUserDetails":
        return await userOperations.getUserDetails(data, adminClient);
      
      case "getAllUsers":
        return await userOperations.getAllUsers(adminClient);

      case "processKyc":
        console.log("🔍 Processing KYC operation with data:", data);
        
        // Add extra validation for KYC operations
        if (!data || !data.kycId) {
          console.error("Missing kycId in KYC operation data");
          throw new Error("KYC ID is required");
        }
        
        if (!data.status || !['approved', 'rejected', 'needs_clarification'].includes(data.status)) {
          console.error("Invalid status in KYC operation:", data.status);
          throw new Error("Invalid status. Must be one of: approved, rejected, needs_clarification");
        }
        
        // Check if the specified KYC record exists first
        const { data: kycCheck, error: kycCheckError } = await adminClient
          .from("kyc_verifications")
          .select("id, status")
          .eq("id", data.kycId)
          .maybeSingle();
          
        if (kycCheckError) {
          console.error("Error checking KYC existence:", kycCheckError);
          throw new Error(`Error verifying KYC record: ${kycCheckError.message}`);
        }
        
        if (!kycCheck) {
          console.error(`KYC record with ID ${data.kycId} not found`);
          throw new Error(`KYC record with ID ${data.kycId} not found`);
        }
        
        console.log(`Found KYC record with current status: ${kycCheck.status}`);
        
        // Proceed with KYC processing
        console.log(`🚀 Executing KYC operation for ID ${data.kycId} with status ${data.status}`);
        const kycResult = await kycOperations.processKyc(data, user, adminClient);
        console.log("✅ KYC operation completed successfully:", kycResult);
        return kycResult;

      case "requestKycClarification":
        console.log("🔍 Processing KYC clarification request with data:", data);
        
        // Add extra validation for clarification requests
        if (!data || !data.kycId) {
          console.error("Missing kycId in clarification request data");
          throw new Error("KYC ID is required");
        }
        
        if (!data.message) {
          console.error("Missing message in clarification request");
          throw new Error("Clarification message is required");
        }
        
        // Check if the specified KYC record exists first
        const { data: clarifyCheck, error: clarifyCheckError } = await adminClient
          .from("kyc_verifications")
          .select("id, status")
          .eq("id", data.kycId)
          .maybeSingle();
          
        if (clarifyCheckError) {
          console.error("Error checking KYC existence for clarification:", clarifyCheckError);
          throw new Error(`Error verifying KYC record: ${clarifyCheckError.message}`);
        }
        
        if (!clarifyCheck) {
          console.error(`KYC record with ID ${data.kycId} not found for clarification`);
          throw new Error(`KYC record with ID ${data.kycId} not found`);
        }
        
        console.log(`Found KYC record for clarification with current status: ${clarifyCheck.status}`);
        
        // Proceed with clarification request
        console.log(`🚀 Executing KYC clarification request for ID ${data.kycId}`);
        const clarificationResult = await kycOperations.requestKycClarification(data, user, adminClient);
        console.log("✅ KYC clarification request completed successfully:", clarificationResult);
        return clarificationResult;

      case "markTokensSent":
        return await transactionOperations.markTokensSent(data, adminClient);

      default:
        console.error("Unknown admin operation:", action);
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error(`❌ Error in admin operation '${action}':`, error);
    // Return a structured error response
    return {
      error: {
        message: error.message,
        details: error.details || {},
        code: error.code || 'UNKNOWN_ERROR',
        action: action,
        data: error.data || null,
        timestamp: new Date().toISOString()
      }
    };
  }
}
