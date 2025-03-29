
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import PersonalInfoForm from '@/components/KYC/PersonalInfoForm';
import { PersonalInfoValues } from '@/components/KYC/schema/personalInfoSchema';
import { KycVerificationData } from '@/hooks/kyc/types';
import { getDefaultPersonalInfoValues } from './TabHandlers';

interface PersonalInfoTabProps {
  kycData: KycVerificationData | null;
  isPending: boolean;
  onSubmit: (values: PersonalInfoValues) => Promise<void>;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ 
  kycData, 
  isPending, 
  onSubmit 
}) => {
  const defaultValues = getDefaultPersonalInfoValues(kycData);

  return (
    <TabsContent value="personal-info" className="py-4">
      <PersonalInfoForm 
        defaultValues={defaultValues} 
        onSubmit={onSubmit}
        isPending={isPending}
      />
    </TabsContent>
  );
};

export default PersonalInfoTab;
