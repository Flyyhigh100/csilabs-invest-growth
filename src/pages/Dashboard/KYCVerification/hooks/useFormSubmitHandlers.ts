
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { PersonalInfoValues } from '@/components/KYC/schema/personalInfoSchema';
import { DebugInfo } from './useDebugInfo';

/**
 * Hook to handle KYC form submissions
 */
export const useFormSubmitHandlers = (
  refetch: () => Promise<any>,
  savePersonalInfo: any, 
  setActiveTab: (tab: string) => void,
  updateDebugInfo: (updates: Partial<DebugInfo>) => void
) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handler for personal info form submission
  const handlePersonalInfoSubmit = async (values: PersonalInfoValues) => {
    if (!user) {
      toast.error('You must be logged in to complete verification');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting personal info:', values);
      
      // Create a KYC form data object with correct property names (snake_case)
      const kycFormData = {
        first_name: values.first_name,
        last_name: values.last_name,
        date_of_birth: values.date_of_birth,
        nationality: values.nationality,
        address: values.address,
        city: values.city,
        postal_code: values.postal_code,
        country: values.country
      };
      
      const response = await savePersonalInfo.mutateAsync(kycFormData);
      
      // Store response in debug info
      updateDebugInfo({
        apiResponses: [{
          type: 'personal_info_save',
          data: response,
          timestamp: new Date().toISOString()
        }]
      });
      
      toast.success('Personal information saved successfully');
      
      // Move to the next tab
      setActiveTab('documents');
    } catch (error) {
      console.error('Error saving personal info:', error);
      
      // Update debug info with error
      updateDebugInfo({
        errors: [{
          type: 'personal_info_error',
          message: (error as Error).message,
          stack: (error as Error).stack,
          timestamp: new Date().toISOString()
        }],
        lastError: {
          message: (error as any).message,
          code: (error as any).code,
          details: (error as any).details,
          hint: (error as any).hint
        }
      });
      
      toast.error(`Failed to save personal information: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handlePersonalInfoSubmit,
    isSubmitting,
    setIsSubmitting
  };
};
