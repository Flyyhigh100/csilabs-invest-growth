
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, User, Wallet } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { profileFormSchema, ProfileFormValues } from '@/components/Auth/schema/sharedValidationSchema';
import SharedPhoneInput from '@/components/shared/FormComponents/SharedPhoneInput';
import SharedAddressInputGroup from '@/components/shared/FormComponents/SharedAddressInputGroup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EnhancedProfileFormProps {
  profileData: any;
  isLoading: boolean;
}

const EnhancedProfileForm: React.FC<EnhancedProfileFormProps> = ({ profileData, isLoading }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
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
          wallet_address: values.wallet_address || null,
          solana_wallet_address: values.solana_wallet_address || null,
          preferred_network: values.preferred_network || 'polygon',
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

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      street_address: "",
      city: "",
      state_province: "",
      postal_code: "",
      wallet_address: "",
      solana_wallet_address: "",
      preferred_network: "polygon",
    },
  });

  // Pre-populate form with existing data
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
        wallet_address: profileData.wallet_address || "",
        solana_wallet_address: profileData.solana_wallet_address || "",
        preferred_network: profileData.preferred_network || "polygon",
      });
    }
  }, [profileData, user, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    await updateProfile.mutateAsync(values);
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal details here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <SharedPhoneInput 
              form={form} 
              fieldName="phone_number" 
            />
          </CardContent>
        </Card>

        {/* Address Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
            <CardDescription>
              Update your address details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SharedAddressInputGroup 
              form={form} 
              fieldPrefix="" 
            />
          </CardContent>
        </Card>

        {/* Wallet Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Information
            </CardTitle>
            <CardDescription>
              Manage your cryptocurrency wallet addresses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="preferred_network"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Network</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your preferred network" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="polygon">Polygon</SelectItem>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="solana">Solana</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose your preferred blockchain network for transactions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wallet_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Polygon/Ethereum Wallet Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="0x..." 
                      {...field}
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormDescription>
                    Your Polygon or Ethereum wallet address for receiving tokens.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="solana_wallet_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solana Wallet Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Solana wallet address..." 
                      {...field}
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormDescription>
                    Your Solana wallet address for receiving tokens.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          disabled={updateProfile.isPending || !form.formState.isDirty}
          className="w-full"
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

export default EnhancedProfileForm;
