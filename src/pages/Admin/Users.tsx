
import React, { useState } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import UserTable from '@/components/Admin/Users/UserTable';
import UserDetailsDialog from '@/components/Admin/Users/UserDetailsDialog';
import SearchBar from '@/components/Admin/Users/SearchBar';
import Pagination from '@/components/Admin/Users/Pagination';
import { useUserManagement } from '@/hooks/useUserManagement';
import type { UserSchemaType } from '@/components/Admin/Users/UserForm';

const AdminUsersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const {
    users,
    isLoading,
    error,
    kycMap,
    totalCount,
    selectedUser,
    setSelectedUser,
    updateUser,
    deleteUser,
    isUpdating,
    isDeleting,
  } = useUserManagement(search, page, pageSize);

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleSaveUser = (values: UserSchemaType) => {
    updateUser(values);
  };

  const handleDeleteUser = () => {
    deleteUser();
    setIsDialogOpen(false);
  };

  if (error) {
    return (
      <AdminLayout title="Users">
        <div className="flex items-center justify-center h-full text-red-500">
          Error: {(error as Error).message}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Users">
      <div className="container mx-auto py-10">
        <SearchBar 
          value={search} 
          onChange={(value) => {
            setSearch(value);
            setPage(1); // Reset to first page on new search
          }} 
        />

        <UserTable 
          users={users} 
          kycMap={kycMap} 
          onViewUser={handleViewUser} 
          isLoading={isLoading} 
        />

        <Pagination 
          page={page} 
          totalCount={totalCount} 
          pageSize={pageSize} 
          onPageChange={setPage} 
        />
        
        <UserDetailsDialog 
          user={selectedUser}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSaveUser}
          onDelete={handleDeleteUser}
          isSubmitting={isUpdating}
          isDeleting={isDeleting}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
