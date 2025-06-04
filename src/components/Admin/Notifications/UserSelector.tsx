
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeText } from '@/utils/security/inputSanitization';

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

  // Filter out any users with empty IDs and sanitize data
  const validUsers = displayUsers
    .filter(user => user.id && user.id.trim() !== '')
    .map(user => ({
      ...user,
      email: user.email ? sanitizeText(user.email) : '',
      first_name: (user as any).first_name ? sanitizeText((user as any).first_name) : '',
      last_name: (user as any).last_name ? sanitizeText((user as any).last_name) : ''
    }));
  
  // Default placeholder value when no user is selected
  const SELECT_USER_PLACEHOLDER = "select-user";

  const handleUserSelection = (selectedUserId: string) => {
    if (selectedUserId === SELECT_USER_PLACEHOLDER) {
      return;
    }
    
    // Validate that the selected user exists in our list
    const isValidUser = validUsers.some(user => user.id === selectedUserId);
    
    if (isValidUser) {
      setUserId(selectedUserId);
    } else {
      console.error('Invalid user selection attempted');
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="user">User</Label>
      <Select 
        value={userId || SELECT_USER_PLACEHOLDER} 
        onValueChange={handleUserSelection}
        disabled={loading}
      >
        <SelectTrigger>
          <SelectValue placeholder={loading ? "Loading users..." : "Select a user"} />
        </SelectTrigger>
        <SelectContent>
          <ScrollArea className="h-72">
            {validUsers.length > 0 ? (
              validUsers.map(user => {
                const displayName = user.email || 
                  (user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}`.trim() 
                    : user.id);
                
                return (
                  <SelectItem key={user.id} value={user.id}>
                    {displayName}
                  </SelectItem>
                );
              })
            ) : (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No users available
              </div>
            )}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserSelector;
