import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import type { User, KycVerification } from '@/types/admin/users';
import type { UserSchemaType } from '@/components/Admin/Users/UserForm';

export const useUserManagement = (search: string, page: number, pageSize: number) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch users
  const { 
    isLoading, 
    error, 
    data: users 
  } = useQuery({
    queryKey: ['admin-users', search, page, pageSize],
    queryFn: async () => {
      // Fetch profiles from the profiles table with all the needed columns
      const { data: profilesData, error: profilesError, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .ilike('first_name', `%${search}%`)
        .or(`last_name.ilike.%${search}%,wallet_address.ilike.%${search}%,email.ilike.%${search}%`)
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw new Error(profilesError.message);
      }

      setTotalCount(count || 0);
      
      // Transform the profiles data to match User type
      const transformedData = profilesData?.map(profile => ({
        ...profile,
        // These fields now exist in the profiles table, but set defaults just in case
        email: profile.email || '',
        role: profile.role || 'user',
        status: profile.status || 'pending',
        rejection_reason: profile.rejection_reason || undefined,
      })) as User[];
      
      return transformedData;
    }
  });

  // Fetch KYC verifications
  const { 
    data: kycData, 
    isLoading: isKycLoading 
  } = useQuery({
    queryKey: ['admin-all-users-kyc'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*');

      if (error) {
        throw new Error(error.message);
      }

      return data as KycVerification[];
    }
  });

  // Create a map of KYC verifications by user ID
  const kycMap = kycData?.reduce((acc: Record<string, KycVerification>, kyc: KycVerification) => {
    acc[kyc.user_id] = kyc;
    return acc;
  }, {}) || {};

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (values: UserSchemaType) => {
      if (!selectedUser) throw new Error("No user selected");
      
      // First update the auth.users email if it changed
      if (values.email !== selectedUser.email) {
        // Note: This might require admin privileges or a server function
        console.log(`Would update email from ${selectedUser.email} to ${values.email}`);
      }
      
      // Then update the profile
      const { error } = await supabase
        .from('profiles')
        .update({
          email: values.email,
          role: values.role,
          status: values.status,
          rejection_reason: values.rejection_reason,
          // Keep the other properties as they were
          first_name: selectedUser.first_name,
          last_name: selectedUser.last_name,
          wallet_address: selectedUser.wallet_address,
        })
        .eq('id', selectedUser.id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) throw new Error("No user selected");
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  return {
    users,
    isLoading,
    error,
    kycMap,
    isKycLoading,
    totalCount,
    selectedUser,
    setSelectedUser,
    updateUser: (values: UserSchemaType) => updateUserMutation.mutate(values),
    deleteUser: () => deleteUserMutation.mutate(),
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  };
};
