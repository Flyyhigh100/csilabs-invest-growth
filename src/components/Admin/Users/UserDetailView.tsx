
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserCircle, Calendar, AtSign, Wallet, AlertTriangle } from 'lucide-react';
import UserTransactionDashboard from './UserTransactions/UserTransactionDashboard';
import { TestIconLucide } from '@/components/icons/TestIcon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatCurrency } from '@/utils/format';

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
              
              {/* Transaction Value Summary */}
              {user.completed_transaction_value !== undefined && (
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="w-full">
                    <p className="text-sm font-medium text-muted-foreground">Transaction Summary</p>
                    <div className="mt-2 grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between items-center bg-green-50 px-2 py-1 rounded-sm">
                        <span className="text-green-700 font-medium">Real Value (Completed):</span>
                        <span className="text-green-700 font-medium">{formatCurrency(user.completed_transaction_value || 0)}</span>
                      </div>
                      
                      {user.pending_transaction_value > 0 && (
                        <div className="flex justify-between items-center bg-amber-50 px-2 py-1 rounded-sm">
                          <span className="text-amber-700">Pending Value:</span>
                          <span className="text-amber-700">{formatCurrency(user.pending_transaction_value)}</span>
                        </div>
                      )}
                      
                      {user.test_transaction_value > 0 && (
                        <div className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded-sm">
                          <span className="text-gray-500 flex items-center gap-1">
                            <TestIconLucide className="h-3 w-3 text-amber-500" />
                            Test Value:
                          </span>
                          <span className="text-gray-500">{formatCurrency(user.test_transaction_value)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Test data indicator */}
              {user.has_test_data && (
                <div className="flex items-start gap-3">
                  <TestIconLucide className="h-5 w-5 mt-0.5 text-amber-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-amber-600">Test Data Present</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            This user has test transactions which may affect volume calculations
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-xs text-amber-600">
                      User has test transactions that should be excluded from real volume calculations
                    </p>
                  </div>
                </div>
              )}
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
