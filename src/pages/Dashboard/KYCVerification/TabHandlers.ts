
import { KycVerificationData } from '@/hooks/useKycVerification';

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
