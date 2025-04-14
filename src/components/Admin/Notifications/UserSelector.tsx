
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserSelectorProps {
  userId: string;
  setUserId: (userId: string) => void;
  users: { id: string; email: string; first_name?: string; last_name?: string; }[];
  isLoading: boolean;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  userId,
  setUserId,
  users,
  isLoading,
}) => {
  // Display name formatting function
  const getUserDisplayName = (user: { id: string; email: string | null; first_name?: string | null; last_name?: string | null }) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.email || user.id;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="user">User</Label>
      <Select 
        value={userId} 
        onValueChange={setUserId}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Loading users..." : "Select a user"} />
        </SelectTrigger>
        <SelectContent>
          <ScrollArea className="h-72">
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {getUserDisplayName(user)}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserSelector;
