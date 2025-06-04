
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import SecureInput from '@/components/Security/SecureInput';
import SecureForm from '@/components/Security/SecureForm';

const profileFormSchema = z.object({
  first_name: z.string().min(2, { message: "First name must be at least 2 characters" }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }).optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  profileData: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  isLoading: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profileData, isLoading }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (values: Omit<ProfileFormValues, 'email'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  });

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');

  useEffect(() => {
    if (profileData) {
      setFirstName(profileData.first_name || '');
      setLastName(profileData.last_name || '');
    }
  }, [profileData]);

  const onSubmit = async (sanitizedData: Record<string, any>) => {
    await updateProfile.mutateAsync({
      first_name: sanitizedData.first_name,
      last_name: sanitizedData.last_name,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <SecureForm onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SecureInput
          label="First Name"
          value={firstName}
          onChange={setFirstName}
          placeholder="John"
          maxLength={50}
          required
        />
        <SecureInput
          label="Last Name"
          value={lastName}
          onChange={setLastName}
          placeholder="Doe"
          maxLength={50}
          required
        />
      </div>
      
      <SecureInput
        label="Email"
        value={user?.email || ''}
        onChange={() => {}} // Read-only
        type="email"
        placeholder="john.doe@example.com"
        className="opacity-50 cursor-not-allowed"
      />
      
      <input type="hidden" name="first_name" value={firstName} />
      <input type="hidden" name="last_name" value={lastName} />
      
      <Button 
        type="submit" 
        disabled={updateProfile.isPending}
      >
        {updateProfile.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </SecureForm>
  );
};

export default ProfileForm;
