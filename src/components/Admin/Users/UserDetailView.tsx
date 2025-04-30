
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserCircle, Calendar, AtSign, Wallet } from 'lucide-react';
import UserTransactionDashboard from './UserTransactions/UserTransactionDashboard';

interface UserDetailProps {
  user: any;
  onCheckKyc?: (userId: string) => void;
}

const UserDetailView: React.FC<UserDetailProps> = ({ user, onCheckKyc }) => {
  if (!user) return null;

  const renderKycStatus = (status?: string) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;

    switch(status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'needs_clarification':
        return <Badge className="bg-blue-100 text-blue-800">Needs Clarification</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User Profile</CardTitle>
          <CardDescription>
            Created on {new Date(user.created_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <UserCircle className="h-5 w-5 mt-0.5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {user.first_name || user.last_name 
                      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                      : 'Not provided'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <AtSign className="h-5 w-5 mt-0.5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 mt-0.5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                  <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Wallet className="h-5 w-5 mt-0.5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Wallet Address</p>
                  <p className="font-mono text-xs break-all">
                    {user.wallet_address || 'Not provided'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">KYC Status</p>
                  <div className="mt-1">
                    {renderKycStatus(user.kyc_status)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="kyc">KYC Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="pt-4">
          <UserTransactionDashboard userId={user.id} />
        </TabsContent>
        
        <TabsContent value="kyc" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>KYC Information</CardTitle>
              <CardDescription>Know Your Customer verification details</CardDescription>
            </CardHeader>
            <CardContent>
              {user.kyc_status ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <div className="mt-1">{renderKycStatus(user.kyc_status)}</div>
                    </div>
                    {user.kyc_id && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">KYC ID</p>
                        <p className="font-mono text-xs">{user.kyc_id}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => onCheckKyc && onCheckKyc(user.id)}
                      variant="outline"
                    >
                      View Complete KYC Details
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>This user has not completed KYC verification.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDetailView;
