
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import DeleteUserDialog from './DeleteUserDialog';
import UserForm from './UserForm';
import type { User } from '@/types/admin/users';
import type { UserSchemaType } from './UserForm';

interface UserDetailsDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: UserSchemaType) => void;
  onDelete: () => void;
  isSubmitting: boolean;
  isDeleting: boolean;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  user,
  open,
  onOpenChange,
  onSave,
  onDelete,
  isSubmitting,
  isDeleting,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <UserForm 
            user={user} 
            onSubmit={onSave} 
            isSubmitting={isSubmitting} 
          />
          
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </AlertDialogTrigger>
        </DialogContent>
      </Dialog>
      
      <DeleteUserDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={onDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default UserDetailsDialog;
