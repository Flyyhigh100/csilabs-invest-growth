import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Mail, Phone, MapPin, Calendar, Wallet, 
  TrendingUp, DollarSign, Clock, FileText, Download,
  AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { EnhancedClientData } from '@/hooks/admin/useEnhancedClientData';
import { TestIconLucide } from '@/components/icons/TestIcon';
import { CopyButton } from '@/components/ui/copy-button';
import UserTransactionDashboard from './UserTransactions/UserTransactionDashboard';
import ProfileNotesCard from '@/components/Dashboard/Profile/ProfileNotesCard';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EnhancedClientDetailViewProps {
  client: EnhancedClientData;
  onClose: () => void;
  onCheckKyc: (userId: string) => void;
  onCEOCallPrep?: () => void;
}

const EnhancedClientDetailView: React.FC<EnhancedClientDetailViewProps> = ({
  client,
  onClose,
  onCheckKyc,
  onCEOCallPrep
}) => {
  // Generate individual client report
  const generateClientReport = () => {
    const reportData = {
      // Basic Info
      name: `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Unnamed Client',
      email: client.email || 'Not provided',
      phone: client.phone_number || 'Not provided',
      address: `${client.street_address || ''} ${client.city || ''} ${client.state_province || ''} ${client.postal_code || ''}`.trim() || 'Not provided',
      memberSince: new Date(client.created_at).toLocaleDateString(),
      
      // KYC Status
      kycStatus: client.kyc_status || 'Not started',
      kycSubmitted: client.kyc_submitted_at ? new Date(client.kyc_submitted_at).toLocaleDateString() : 'Not submitted',
      kycApproved: client.kyc_approved_at ? new Date(client.kyc_approved_at).toLocaleDateString() : 'Not approved',
      
      // Wallets
      polygonWallet: client.wallet_address || 'Not provided',
      solanaWallet: client.solana_wallet_address || 'Not provided',
      
      // Token Summary - THE KEY DATA FOR CEO CALLS
      totalTokensSent: client.total_tokens_sent.toLocaleString(),
      totalTokensPurchased: client.total_tokens_purchased.toLocaleString(),
      tokensPendingDelivery: client.tokens_pending_delivery.toLocaleString(),
      averageTokenPrice: `$${client.average_token_price.toFixed(4)}`,
      
      // Investment Summary
      totalInvested: formatCurrency(client.total_invested),
      completedValue: formatCurrency(client.completed_value),
      pendingValue: formatCurrency(client.pending_value),
      
      // Transaction Summary
      totalTransactions: client.total_transactions,
      completedTransactions: client.completed_transactions,
      pendingTransactions: client.pending_transactions,
      failedTransactions: client.failed_transactions,
      lastTransaction: client.last_transaction_date ? new Date(client.last_transaction_date).toLocaleDateString() : 'None',
      
      // Account Status
      accountStatus: client.status || 'Active',
      accountRole: client.role || 'User'
    };

    // Create CSV content for easy copy/paste into shareholder reports
    const csvContent = [
      ['Client Report Generated', new Date().toLocaleDateString()],
      [''],
      ['BASIC INFORMATION'],
      ['Name', reportData.name],
      ['Email', reportData.email],
      ['Phone', reportData.phone],
      ['Address', reportData.address],
      ['Member Since', reportData.memberSince],
      [''],
      ['KYC VERIFICATION'],
      ['Status', reportData.kycStatus],
      ['Submitted', reportData.kycSubmitted],
      ['Approved', reportData.kycApproved],
      [''],
      ['WALLET ADDRESSES'],
      ['Polygon Wallet', reportData.polygonWallet],
      ['Solana Wallet', reportData.solanaWallet],
      [''],
      ['TOKEN SUMMARY (KEY DATA)'],
      ['Total Tokens Sent', reportData.totalTokensSent],
      ['Total Tokens Purchased', reportData.totalTokensPurchased],
      ['Tokens Pending Delivery', reportData.tokensPendingDelivery],
      ['Average Token Price', reportData.averageTokenPrice],
      [''],
      ['INVESTMENT SUMMARY'],
      ['Total Invested', reportData.totalInvested],
      ['Completed Value', reportData.completedValue],
      ['Pending Value', reportData.pendingValue],
      [''],
      ['TRANSACTION SUMMARY'],
      ['Total Transactions', reportData.totalTransactions.toString()],
      ['Completed Transactions', reportData.completedTransactions.toString()],
      ['Pending Transactions', reportData.pendingTransactions.toString()],
      ['Failed Transactions', reportData.failedTransactions.toString()],
      ['Last Transaction', reportData.lastTransaction],
      [''],
      ['ACCOUNT STATUS'],
      ['Status', reportData.accountStatus],
      ['Role', reportData.accountRole]
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `client-report-${reportData.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderKycStatus = (status: string | null) => {
    if (!status) return <Badge variant="outline">No KYC</Badge>;

    switch(status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>;
      case 'needs_clarification':
        return <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Needs Clarification
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with client name and actions */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            {client.first_name || client.last_name 
              ? `${client.first_name || ''} ${client.last_name || ''}`.trim()
              : 'Unnamed Client'
            }
            {client.has_test_data && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <TestIconLucide className="h-5 w-5 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>Client has test data</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </h2>
          <p className="text-gray-600">
            Member since {new Date(client.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          {onCEOCallPrep && (
            <Button onClick={onCEOCallPrep} className="flex items-center gap-2 bg-primary hover:bg-primary/90">
              <Phone className="h-4 w-4" />
              CEO Call Prep
            </Button>
          )}
          <Button onClick={generateClientReport} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards - CEO's Main Interest */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-green-700">Tokens Sent</p>
                <p className="text-xl font-bold text-green-800">
                  {client.total_tokens_sent.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-700">Total Invested</p>
                <p className="text-xl font-bold text-blue-800">
                  {formatCurrency(client.completed_value)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-orange-700">Tokens Pending</p>
                <p className="text-xl font-bold text-orange-800">
                  {client.tokens_pending_delivery.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-purple-700">Avg Token Price</p>
                <p className="text-xl font-bold text-purple-800">
                  ${client.average_token_price.toFixed(4)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="tokens">Token Details</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="kyc">KYC</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-1 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{client.email || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 mt-1 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{client.phone_number || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <div className="font-medium">
                      {client.street_address && <p>{client.street_address}</p>}
                      {(client.city || client.state_province) && (
                        <p>{client.city}{client.city && client.state_province ? ', ' : ''}{client.state_province}</p>
                      )}
                      {client.postal_code && <p>{client.postal_code}</p>}
                      {!client.street_address && !client.city && !client.state_province && !client.postal_code && (
                        <span className="text-gray-400">Not provided</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Wallet Addresses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.wallet_address && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-purple-100 text-purple-800">
                        Polygon
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                      <code className="text-xs flex-1 break-all">{client.wallet_address}</code>
                      <CopyButton value={client.wallet_address} variant="ghost" size="sm" />
                    </div>
                  </div>
                )}
                
                {client.solana_wallet_address && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Solana
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                      <code className="text-xs flex-1 break-all">{client.solana_wallet_address}</code>
                      <CopyButton value={client.solana_wallet_address} variant="ghost" size="sm" />
                    </div>
                  </div>
                )}
                
                {!client.wallet_address && !client.solana_wallet_address && (
                  <p className="text-gray-500">No wallet addresses provided</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Token Summary - Shareholder Report Data</CardTitle>
              <CardDescription>
                Complete token information for this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Tokens Delivered</h4>
                    <p className="text-2xl font-bold text-green-800">
                      {client.total_tokens_sent.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600">Successfully sent to wallet</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Tokens Purchased</h4>
                    <p className="text-2xl font-bold text-blue-800">
                      {client.total_tokens_purchased.toLocaleString()}
                    </p>
                    <p className="text-sm text-blue-600">Total from completed transactions</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">Tokens Pending</h4>
                    <p className="text-2xl font-bold text-orange-800">
                      {client.tokens_pending_delivery.toLocaleString()}
                    </p>
                    <p className="text-sm text-orange-600">Awaiting delivery</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Average Price</h4>
                    <p className="text-2xl font-bold text-purple-800">
                      ${client.average_token_price.toFixed(4)}
                    </p>
                    <p className="text-sm text-purple-600">Per token across all purchases</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <UserTransactionDashboard userId={client.id} />
            </TabsContent>
            
            <TabsContent value="communication" className="space-y-4">
              <ProfileNotesCard targetUserId={client.id} />
            </TabsContent>
            
            <TabsContent value="kyc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                KYC Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Status</p>
                    {renderKycStatus(client.kyc_status)}
                  </div>
                </div>
                
                {client.kyc_submitted_at && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Submitted</p>
                      <p className="font-medium">{new Date(client.kyc_submitted_at).toLocaleDateString()}</p>
                    </div>
                    {client.kyc_approved_at && (
                      <div>
                        <p className="text-gray-600">Approved</p>
                        <p className="font-medium">{new Date(client.kyc_approved_at).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => onCheckKyc(client.id)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    View Full KYC Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedClientDetailView;