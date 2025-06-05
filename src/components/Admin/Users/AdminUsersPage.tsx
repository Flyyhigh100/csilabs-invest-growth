
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import EnhancedUsersTable from './EnhancedUsersTable';
import UsersToolbar from './UsersToolbar';
import UserStats from './Dashboard/UserStats';

const AdminUsersPage = () => {
  const {
    users,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    handleRefresh,
    checkUserKyc,
  } = useAdminUsers();

  console.log('📊 AdminUsersPage render state:', {
    usersCount: users.length,
    isLoading,
    hasError: !!error,
    errorMessage: error?.message
  });

  return (
    <AdminLayout title="Users Management">
      <div className="space-y-6">
        {/* User Statistics */}
        <UserStats users={users} />

        {/* Users Management Card */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Manage and view all registered users with detailed authentication information and transaction history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <UsersToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onRefresh={handleRefresh}
                isLoading={isLoading}
              />
              
              <EnhancedUsersTable
                users={users}
                onCheckKyc={checkUserKyc}
                searchQuery={searchQuery}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
