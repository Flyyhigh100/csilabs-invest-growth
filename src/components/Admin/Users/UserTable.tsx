
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { formatDate } from '@/utils/admin/users';
import type { User, KycVerification } from '@/types/admin/users';

interface UserTableProps {
  users: User[] | undefined;
  kycMap: Record<string, KycVerification>;
  onViewUser: (user: User) => void;
  isLoading: boolean;
}

const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  kycMap, 
  onViewUser,
  isLoading,
}) => {
  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>KYC Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user: User) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.id}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.status}</TableCell>
              <TableCell>
                {kycMap[user.id]?.status || 'Not Started'}
              </TableCell>
              <TableCell className="text-right">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onViewUser(user)}
                    >
                      View
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
