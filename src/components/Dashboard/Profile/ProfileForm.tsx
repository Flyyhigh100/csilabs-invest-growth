
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { enhancedProfileFormSchema, EnhancedProfileFormValues } from './schema/enhancedProfileSchema';
import PhoneNumberInput from './FormInputs/PhoneNumberInput';
import AddressInputs from './FormInputs/AddressInputs';

interface ProfileFormProps {
  profileData: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone_number: string | null;
    street_address: string | null;
    city: string | null;
    state_province: string | null;
    postal_code: string | null;
  } | null;
  isLoading: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profileData, isLoading }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (values: Omit<EnhancedProfileFormValues, 'email'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          phone_number: values.phone_number || null,
          street_address: values.street_address || null,
          city: values.city || null,
          state_province: values.state_province || null,
          postal_code: values.postal_code || null,
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

  const form = useForm<EnhancedProfileFormValues>({
    resolver: zodResolver(enhancedProfileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: user?.email || "",
      phone_number: "",
      street_address: "",
      city: "",
      state_province: "",
      postal_code: "",
    },
  });

  useEffect(() => {
    if (profileData) {
      form.reset({
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        email: user?.email || "",
        phone_number: profileData.phone_number || "",
        street_address: profileData.street_address || "",
        city: profileData.city || "",
        state_province: profileData.state_province || "",
        postal_code: profileData.postal_code || "",
      });
    }
  }, [profileData, user, form]);

  const onSubmit = async (values: EnhancedProfileFormValues) => {
    await updateProfile.mutateAsync({
      first_name: values.first_name,
      last_name: values.last_name,
      phone_number: values.phone_number,
      street_address: values.street_address,
      city: values.city,
      state_province: values.state_province,
      postal_code: values.postal_code,
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} disabled />
                </FormControl>
                <FormDescription>
                  Your email address cannot be changed.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <PhoneNumberInput form={form} />
        </div>

        {/* Address Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Address Information</h3>
          <AddressInputs form={form} />
        </div>

        <Button 
          type="submit" 
          disabled={updateProfile.isPending || !form.formState.isDirty}
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
      </form>
    </Form>
  );
};

export default ProfileForm;
