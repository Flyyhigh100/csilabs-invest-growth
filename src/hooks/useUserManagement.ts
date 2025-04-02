
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
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .ilike('email', `%${search}%`)
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setTotalCount(count || 0);
      
      // Transform the data to match User type
      const transformedData = data?.map(profile => ({
        ...profile,
        // Default values for fields not in profiles table
        email: profile.email || '',
        role: profile.role || 'user',
        status: profile.status || 'pending',
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
      
      // Then update the profile with role and status
      const { error } = await supabase
        .from('profiles')
        .update({
          // Make sure these fields exist in the profiles table
          status: values.status,
          rejection_reason: values.rejection_reason,
          role: values.role,
          // Don't update email in profiles if it's not part of the schema
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
