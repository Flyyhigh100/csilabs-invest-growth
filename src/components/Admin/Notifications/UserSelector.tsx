
import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserSelectorProps {
  userId: string;
  setUserId: (userId: string) => void;
  users: { id: string; email: string }[];
  isLoading: boolean;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  userId,
  setUserId,
  users,
  isLoading,
}) => {
  // Query to fetch all users from the profiles table
  const { data: allUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .order('email');
      
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  // Use the fetched users if available, otherwise fall back to the provided users
  const displayUsers = allUsers || users;
  const loading = isLoading || isLoadingUsers;

  return (
    <div className="space-y-2">
      <Label htmlFor="user">User</Label>
      <Select 
        value={userId} 
        onValueChange={setUserId}
        disabled={loading}
      >
        <SelectTrigger>
          <SelectValue placeholder={loading ? "Loading users..." : "Select a user"} />
        </SelectTrigger>
        <SelectContent>
          <ScrollArea className="h-72">
            {displayUsers.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.email || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.id}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserSelector;
