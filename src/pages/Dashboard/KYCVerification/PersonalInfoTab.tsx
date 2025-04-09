
import React from 'react';
import PersonalInfoForm from '@/components/KYC/PersonalInfoForm';
import { PersonalInfoValues } from '@/components/KYC/schema/personalInfoSchema';
import { KycVerificationData } from '@/hooks/kyc/types';

interface PersonalInfoTabProps {
  kycData: KycVerificationData | null;
  isPending: boolean;
  onSubmit: (values: PersonalInfoValues) => Promise<void>;
  isSubmitting?: boolean; // Add this prop
  isDisabled?: boolean;   // Add this prop
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ 
  kycData, 
  isPending, 
  onSubmit,
  isSubmitting = false,  // Provide default value
  isDisabled = false     // Provide default value
}) => {
  const defaultValues = {
    first_name: kycData?.first_name || "",
    last_name: kycData?.last_name || "",
    date_of_birth: kycData?.date_of_birth || "",
    nationality: kycData?.nationality || "",
    address: kycData?.address || "",
    city: kycData?.city || "",
    postal_code: kycData?.postal_code || "",
    country: kycData?.country || "",
  };

  return (
    <div className="py-4">
      <PersonalInfoForm 
        defaultValues={defaultValues} 
        onSubmit={onSubmit}
        isPending={isPending || isSubmitting || isDisabled}
      />
    </div>
  );
};

export default PersonalInfoTab;
