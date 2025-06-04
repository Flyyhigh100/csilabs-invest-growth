import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Shield, 
  User, 
  Mail, 
  Calendar,
  Activity,
  Wallet,
  FileCheck
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface UserAuthDetails {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  emailConfirmed: boolean;
  emailConfirmedAt?: string | null;
  confirmationSentAt?: string | null;
  authMethod: string;
  signupMethod: string;
  hasPassword: boolean;
  loginStatus: string;
  lastSignInAt?: string | null;
  daysSinceLogin?: number | null;
  createdAt: string;
  accountAge: number;
  confirmedAt?: string | null;
  phoneConfirmedAt?: string | null;
  isAnonymous: boolean;
  providers: string[];
  walletAddress?: string | null;
  preferredNetwork?: string | null;
  kycStatus: string;
  kycSubmittedAt?: string | null;
  recentTransactions: any[];
  totalTransactions: number;
}

interface UserAuthDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authDetails: UserAuthDetails | null;
  isLoading: boolean;
}

const UserAuthDetailDialog: React.FC<UserAuthDetailDialogProps> = ({
  open,
  onOpenChange,
  authDetails,
  isLoading
}) => {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getLoginStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active User</Badge>;
      case 'occasional':
        return <Badge className="bg-yellow-100 text-yellow-800">Occasional User</Badge>;
      case 'inactive':
        return <Badge className="bg-orange-100 text-orange-800">Inactive User</Badge>;
      case 'never-logged-in':
        return <Badge className="bg-red-100 text-red-800">Never Logged In</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getEmailStatusIcon = (confirmed: boolean) => {
    return confirmed ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading authentication details...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!authDetails) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium">Failed to load authentication details</p>
              <p className="text-sm text-gray-500 mt-2">
                This might be a temporary issue. Please try again in a moment.
              </p>
              <button 
                onClick={() => onOpenChange(false)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication Details: {authDetails.firstName} {authDetails.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Name:</span> {authDetails.firstName} {authDetails.lastName}
              </div>
              <div>
                <span className="font-medium">Email:</span> {authDetails.email}
              </div>
              <div>
                <span className="font-medium">User ID:</span>
                <span className="font-mono text-xs">{authDetails.userId}</span>
              </div>
              <div>
                <span className="font-medium">Account Age:</span> {authDetails.accountAge} days
              </div>
              <div>
                <span className="font-medium">Registered:</span> {formatDate(authDetails.createdAt)}
              </div>
            </CardContent>
          </Card>

          {/* Email Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                {getEmailStatusIcon(authDetails.emailConfirmed)}
                <span className="font-medium">
                  {authDetails.emailConfirmed ? 'Email Confirmed' : 'Email Pending'}
                </span>
              </div>
              {authDetails.emailConfirmedAt && (
                <div>
                  <span className="font-medium">Confirmed At:</span> {formatDate(authDetails.emailConfirmedAt)}
                </div>
              )}
              {authDetails.confirmationSentAt && (
                <div>
                  <span className="font-medium">Confirmation Sent:</span> {formatDate(authDetails.confirmationSentAt)}
                </div>
              )}
              {!authDetails.emailConfirmed && (
                <div className="text-amber-600 text-sm">
                  ⚠️ User may need to check email or request new confirmation
                </div>
              )}
            </CardContent>
          </Card>

          {/* Authentication Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Authentication Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Current Method:</span> {authDetails.authMethod}
              </div>
              <div>
                <span className="font-medium">Signup Method:</span> {authDetails.signupMethod}
              </div>
              <div>
                <span className="font-medium">Has Password:</span> {authDetails.hasPassword ? 'Yes' : 'No'}
              </div>
              <div>
                <span className="font-medium">Providers:</span> {authDetails.providers.join(', ') || 'None'}
              </div>
              {authDetails.authMethod === 'Magic Link' && (
                <div className="text-blue-600 text-sm">
                  ℹ️ User signs in via email links (no password required)
                </div>
              )}
            </CardContent>
          </Card>

          {/* Login Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Login Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                {getLoginStatusBadge(authDetails.loginStatus)}
              </div>
              {authDetails.lastSignInAt ? (
                <>
                  <div>
                    <span className="font-medium">Last Login:</span> {formatDate(authDetails.lastSignInAt)}
                  </div>
                  <div>
                    <span className="font-medium">Days Since Login:</span> {authDetails.daysSinceLogin}
                  </div>
                </>
              ) : (
                <div className="text-red-600 text-sm">
                  ⚠️ User has never logged in since registration
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wallet & Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Wallet & Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Wallet Address:</span>
                {authDetails.walletAddress ? (
                  <span className="font-mono text-xs block">{authDetails.walletAddress}</span>
                ) : (
                  <span className="text-gray-500">Not set</span>
                )}
              </div>
              <div>
                <span className="font-medium">Preferred Network:</span> {authDetails.preferredNetwork || 'Not set'}
              </div>
            </CardContent>
          </Card>

          {/* KYC & Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                KYC & Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">KYC Status:</span> {authDetails.kycStatus}
              </div>
              {authDetails.kycSubmittedAt && (
                <div>
                  <span className="font-medium">KYC Submitted:</span> {formatDate(authDetails.kycSubmittedAt)}
                </div>
              )}
              <div>
                <span className="font-medium">Recent Transactions:</span> {authDetails.totalTransactions}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Troubleshooting Section */}
        <Separator className="my-6" />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Troubleshooting Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {!authDetails.emailConfirmed && (
                <div className="p-2 bg-red-50 border border-red-200 rounded">
                  <strong>Email Not Confirmed:</strong> User needs to check email for confirmation link or request a new one.
                </div>
              )}
              {authDetails.loginStatus === 'never-logged-in' && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <strong>Never Logged In:</strong> User registered but never completed first login. May need password reset.
                </div>
              )}
              {authDetails.authMethod === 'Magic Link' && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                  <strong>Magic Link User:</strong> User doesn't have a password. They sign in via email links only.
                </div>
              )}
              {!authDetails.walletAddress && authDetails.totalTransactions > 0 && (
                <div className="p-2 bg-orange-50 border border-orange-200 rounded">
                  <strong>Missing Wallet:</strong> User has transactions but no wallet address set.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default UserAuthDetailDialog;
