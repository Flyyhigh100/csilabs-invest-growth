import React, { useMemo } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Eye, RefreshCw } from 'lucide-react';
import AuthStatusBadge from './AuthStatusBadge';
import LastLoginDisplay from './LastLoginDisplay';
import UserAuthDetailDialog from './UserAuthDetailDialog';
import { User } from '@/hooks/admin/useAdminUsers';
import { useUserAuthDetails } from '@/hooks/admin/useUserAuthDetails';

interface EnhancedUsersTableProps {
  users: User[];
  onCheckKyc: (userId: string) => void;
  searchQuery: string;
  isLoading?: boolean;
  error?: Error | null;
}

const EnhancedUsersTable: React.FC<EnhancedUsersTableProps> = ({ 
  users, 
  onCheckKyc, 
  searchQuery,
  isLoading = false,
  error = null
}) => {
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);

  // Fetch auth details for selected user
  const { 
    authDetails, 
    isLoading: isLoadingAuthDetails 
  } = useUserAuthDetails(selectedUserId);

  console.log('🎯 EnhancedUsersTable render:', {
    usersCount: users.length,
    isLoading,
    hasError: !!error,
    searchQuery
  });

  const renderKycStatusBadge = (status?: string, hasKycRecord?: boolean, kycComplete?: boolean) => {
    if (hasKycRecord === false) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">
        <AlertCircle className="h-3 w-3 mr-1" /> No KYC
      </Badge>;
    }
    
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          {kycComplete ? 'Pending Review' : 'Pending Completion'}
        </Badge>;
      case 'needs_clarification':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Needs Clarification</Badge>;
      case 'not_started':
        return <Badge variant="outline">Not Started</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderTestDataBadge = (user: User) => {
    if (!user.has_test_data) return null;
    
    return (
      <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
        Test Data ({user.test_transaction_count || 0} tx)
      </Badge>
    );
  };

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const searchLower = searchQuery.toLowerCase();
    return users.filter(user => {
      const searchableText = [
        user.first_name,
        user.last_name,
        user.email,
        user.wallet_address,
        user.id
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchableText.includes(searchLower);
    });
  }, [users, searchQuery]);

  // Show error state with retry option
  if (error && !isLoading) {
    return (
      <div className="space-y-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>Failed to load users:</strong> {error.message}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show loading state
  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <span className="text-gray-600">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Info</TableHead>
              <TableHead>Email & Auth</TableHead>
              <TableHead>Wallet Address</TableHead>
              <TableHead>Login Activity</TableHead>
              <TableHead>KYC Status</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : 'No name set'
                        }
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {user.id.substring(0, 8)}...
                      </div>
                      {renderTestDataBadge(user)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{user.email || 'No email'}</div>
                      <div className="flex flex-wrap gap-1">
                        <AuthStatusBadge 
                          emailConfirmed={user.email_confirmed}
                          authMethod={user.auth_method}
                        />
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="font-mono text-xs text-gray-600 max-w-[120px] truncate">
                      {user.wallet_address || 'Not set'}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <LastLoginDisplay 
                      lastSignInAt={user.last_sign_in_at}
                      createdAt={user.created_at}
                    />
                  </TableCell>
                  
                  <TableCell>
                    {renderKycStatusBadge(user.kyc_status, user.has_kyc_record, user.kyc_complete)}
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        {user.test_transaction_count || 0} transactions
                      </div>
                      {user.test_transaction_value > 0 && (
                        <div className="text-xs text-gray-500">
                          ${user.test_transaction_value.toFixed(2)} total
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onCheckKyc(user.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="text-gray-500">
                    {searchQuery ? (
                      <>
                        <AlertCircle className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                        <div>No users match your search criteria</div>
                        <div className="text-sm mt-2">Try adjusting your search terms</div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                        <div>No users found</div>
                        <div className="text-sm mt-2">Users will appear here once data is loaded</div>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Loading overlay for refresh actions */}
      {isLoading && users.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Refreshing user data...
          </div>
        </div>
      )}

      {/* User Auth Detail Dialog */}
      <UserAuthDetailDialog
        open={!!selectedUserId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUserId(null);
          }
        }}
        authDetails={authDetails}
        isLoading={isLoadingAuthDetails}
      />
    </>
  );
};

export default EnhancedUsersTable;
