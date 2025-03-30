
import { KycVerificationData } from '@/hooks/kyc/types';

// Helper function to determine the initial active tab based on KYC status
export const getInitialActiveTab = (kycData: KycVerificationData | null): string => {
  const status = kycData?.status || 'not_started';
  
  if (status === 'pending' || status === 'approved' || status === 'rejected') {
    console.log("Setting initial tab to verification-status based on status:", status);
    return "verification-status";
  }
  
  return "personal-info";
};

// Helper to check if all documents are uploaded
export const areAllDocumentsUploaded = (kycData: KycVerificationData | null): boolean => {
  if (!kycData) return false;
  
  return !!kycData.id_front_url && !!kycData.id_back_url && !!kycData.selfie_url;
};

// Helper to prepare default values for personal info form
export const getDefaultPersonalInfoValues = (kycData: KycVerificationData | null) => {
  return {
    first_name: kycData?.first_name || "",
    last_name: kycData?.last_name || "",
    date_of_birth: kycData?.date_of_birth || "",
    nationality: kycData?.nationality || "",
    address: kycData?.address || "",
    city: kycData?.city || "",
    postal_code: kycData?.postal_code || "",
    country: kycData?.country || "",
  };
};

// Helper to get status-specific user instructions
export const getStatusSpecificInstructions = (kycData: KycVerificationData | null): {
  title: string;
  message: string;
  actionText: string | null;
} => {
  if (!kycData) {
    return {
      title: "Verification Not Started",
      message: "Please complete the verification process to access all platform features.",
      actionText: "Start Verification"
    };
  }

  switch (kycData.status) {
    case 'approved':
      return {
        title: "Verification Approved",
        message: "Your identity has been successfully verified. You now have full access to all platform features.",
        actionText: null
      };
    case 'rejected':
      return {
        title: "Verification Rejected",
        message: `Unfortunately, your verification was rejected. Reason: ${kycData.rejection_reason || "Unspecified reason"}`,
        actionText: "Resubmit Verification"
      };
    case 'pending':
      return {
        title: "Verification in Progress",
        message: "Your identity verification is currently being reviewed. This process usually takes 1-2 business days. We'll notify you once the review is complete.",
        actionText: null
      };
    case 'not_started':
    default:
      return {
        title: "Verification Not Started",
        message: "You haven't started the verification process yet. Complete the verification to unlock all platform features.",
        actionText: "Start Verification"
      };
  }
};
