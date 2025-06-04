
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { PersonalInfoValues } from './schema/personalInfoSchema';
import SecureForm from '@/components/Security/SecureForm';
import SecurePersonalInfoFields from './SecurePersonalInfoFields';

interface PersonalInfoFormProps {
  defaultValues: PersonalInfoValues;
  onSubmit: (values: PersonalInfoValues) => Promise<void>;
  isPending: boolean;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ 
  defaultValues, 
  onSubmit, 
  isPending 
}) => {
  const handleSecureSubmit = async (sanitizedData: Record<string, any>) => {
    // Convert sanitized data back to PersonalInfoValues format
    const personalInfoValues: PersonalInfoValues = {
      first_name: sanitizedData.first_name || '',
      last_name: sanitizedData.last_name || '',
      date_of_birth: sanitizedData.date_of_birth || '',
      nationality: sanitizedData.nationality || '',
      address: sanitizedData.address || '',
      city: sanitizedData.city || '',
      postal_code: sanitizedData.postal_code || '',
      country: sanitizedData.country || '',
    };
    
    await onSubmit(personalInfoValues);
  };

  return (
    <SecureForm onSubmit={handleSecureSubmit} className="space-y-6">
      <SecurePersonalInfoFields defaultValues={defaultValues} />
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save and Continue"
        )}
      </Button>
    </SecureForm>
  );
};

export default PersonalInfoForm;
