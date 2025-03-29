
import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { PersonalInfoValues, personalInfoSchema } from './schema/personalInfoSchema';
import PersonalInfoFormFields from './PersonalInfoFormFields';

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
  const form = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <PersonalInfoFormFields form={form} />
        
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
      </form>
    </Form>
  );
};

export default PersonalInfoForm;
