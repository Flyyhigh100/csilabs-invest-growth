
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

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
                {user.email || user.id}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserSelector;
