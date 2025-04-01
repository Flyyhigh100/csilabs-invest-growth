
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  CheckCircle2, XCircle, AlertTriangle, RefreshCw,
  Copy, Loader2, FileText, DollarSign, Wallet
} from 'lucide-react';
import { toast } from 'sonner';
import { approveTransaction, rejectTransaction } from '@/utils/admin/transactionUtils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getKycDocumentUrl } from '@/utils/admin/kyc';

interface HighValueTransaction {
  id: string;
  user_id: string;
  amount: number;
  created_at: string;
  payment_method: string;
  status: string;
  transaction_id: string;
  wallet_address: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  kyc_verification_id?: string;
}

interface UserData {
  first_name: string | null;
  last_name: string | null;
  email?: string;
}

interface KycData {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  nationality?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  id_front_url?: string;
  id_back_url?: string;
  selfie_url?: string;
}

const fetchHighValueTransactions = async (): Promise<HighValueTransaction[]> => {
  // Fetch high-value crypto transactions that require approval
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('approval_status', 'pending')
    .eq('payment_method', 'crypto')
    .gt('amount', 3000)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

const fetchUserData = async (userId: string): Promise<UserData | null> => {
  // Fetch user profile data
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', userId)
    .single();
  
  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return null;
  }
  
  // Fetch auth user email (requires admin rights)
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
  
  if (userError) {
    console.error('Error fetching user email:', userError);
    return {
      ...profileData,
      email: undefined
    };
  }
  
  return {
    ...profileData,
    email: userData?.user?.email
  };
};

const fetchKycData = async (kycId: string): Promise<KycData | null> => {
  if (!kycId) return null;
  
  const { data, error } = await supabase
    .from('kyc_verifications')
    .select('*')
    .eq('id', kycId)
    .single();
  
  if (error) {
    console.error('Error fetching KYC data:', error);
    return null;
  }
  
  return data;
};

const HighValueTransactions: React.FC = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<HighValueTransaction | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [kycData, setKycData] = useState<KycData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState('transaction');
  
  const {
    data: transactions,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-pending-high-value-transactions'],
    queryFn: fetchHighValueTransactions,
  });
  
  const handleApproveClick = async (transaction: HighValueTransaction) => {
    setSelectedTransaction(transaction);
    
    try {
      // Fetch user data for the transaction
      const userData = await fetchUserData(transaction.user_id);
      setUserData(userData);
      
      // Fetch KYC data if available
      if (transaction.kyc_verification_id) {
        const kycData = await fetchKycData(transaction.kyc_verification_id);
        setKycData(kycData);
      } else {
        setKycData(null);
      }
      
      setConfirmDialogOpen(true);
      setActiveTab('transaction');
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error fetching user data');
    }
  };
  
  const handleConfirmApprove = async () => {
    if (!selectedTransaction) return;
    
    setIsProcessing(true);
    const success = await approveTransaction(selectedTransaction.id);
    setIsProcessing(false);
    
    if (success) {
      setConfirmDialogOpen(false);
      refetch();
    }
  };
  
  const handleConfirmReject = async () => {
    if (!selectedTransaction) return;
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setIsProcessing(true);
    const success = await rejectTransaction(selectedTransaction.id, rejectionReason);
    setIsProcessing(false);
    
    if (success) {
      setConfirmDialogOpen(false);
      setRejectionReason('');
      refetch();
    }
  };
  
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
      .then(() => {
        toast.success('Address copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast.error('Failed to copy address');
      });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-cbis-blue" />
        <span className="ml-2">Loading transactions...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <h3 className="font-bold">Error loading transactions</h3>
        <p>{(error as Error).message}</p>
      </div>
    );
  }
  
  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Pending High-Value Transactions</h3>
          <p className="text-gray-500">
            There are no high-value crypto transactions requiring approval at this time.
          </p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">High-Value Transactions Pending Approval</h3>
        <Button variant="outline" onClick={() => refetch()} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Transactions Requiring Approval</CardTitle>
          <CardDescription>
            These high-value crypto transactions require admin approval before processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Wallet Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.created_at).toLocaleDateString()} 
                    <span className="text-gray-500 ml-2 text-xs">
                      {new Date(transaction.created_at).toLocaleTimeString()}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {transaction.transaction_id.length > 12 
                      ? `${transaction.transaction_id.substring(0, 12)}...` 
                      : transaction.transaction_id}
                  </TableCell>
                  <TableCell className="font-semibold text-amber-700">${transaction.amount.toFixed(2)}</TableCell>
                  <TableCell className="capitalize">{transaction.payment_method}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="font-mono text-xs truncate max-w-[120px]">
                        {transaction.wallet_address}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyAddress(transaction.wallet_address)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApproveClick(transaction)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Transaction Review Dialog */}
      {selectedTransaction && (
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Review High-Value Transaction</DialogTitle>
              <DialogDescription>
                Review transaction details and verify KYC information before approving
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="transaction">Transaction Details</TabsTrigger>
                <TabsTrigger value="kyc" disabled={!kycData}>KYC Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="transaction" className="space-y-4 py-4">
                <div className="p-4 bg-amber-50 text-amber-800 rounded-md mb-4">
                  <AlertTriangle className="h-5 w-5 mb-2" />
                  <p className="font-medium">High-Value Transaction</p>
                  <p className="text-sm">
                    This transaction exceeds $3,000 and requires admin approval before processing.
                    Please review user KYC documents carefully before approving.
                  </p>
                </div>
                
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Transaction ID</span>
                      <p className="font-mono text-sm">{selectedTransaction.transaction_id}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Date</span>
                      <p>{new Date(selectedTransaction.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">User</span>
                    <p>
                      {userData?.first_name} {userData?.last_name}
                      {userData?.email && ` (${userData.email})`}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-md">
                    <DollarSign className="h-5 w-5 text-amber-600" />
                    <div>
                      <span className="text-sm font-medium">Amount</span>
                      <p className="text-2xl font-bold text-amber-700">${selectedTransaction.amount.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="text-sm font-medium">Payment Method</span>
                      <p className="capitalize">{selectedTransaction.payment_method}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="text-sm font-medium">Wallet Address</span>
                        <p className="font-mono text-sm break-all">{selectedTransaction.wallet_address}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleCopyAddress(selectedTransaction.wallet_address)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-md">
                    <Label htmlFor="rejection-reason" className="text-sm font-medium">
                      Rejection Reason (required only if declining)
                    </Label>
                    <Textarea
                      id="rejection-reason"
                      placeholder="Provide a reason for rejecting this transaction..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="kyc" className="space-y-4 py-4">
                {kycData ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="font-medium text-gray-800">Personal Information</h3>
                        <div className="rounded-md border p-4 space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Full Name</span>
                            <p>{kycData.first_name} {kycData.last_name}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Date of Birth</span>
                            <p>{kycData.date_of_birth}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Nationality</span>
                            <p>{kycData.nationality}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Address</span>
                            <p>
                              {kycData.address}, {kycData.city}, {kycData.postal_code}, {kycData.country}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-medium text-gray-800">Verification Documents</h3>
                        <div className="rounded-md border p-4 space-y-3">
                          {kycData.id_front_url && (
                            <Button 
                              variant="outline" 
                              className="w-full flex items-center justify-between"
                              onClick={() => window.open(getKycDocumentUrl(kycData.id_front_url!), '_blank')}
                            >
                              <span className="flex items-center">
                                <FileText className="mr-2 h-4 w-4" />
                                ID Front Side
                              </span>
                              <span className="text-xs text-blue-500">View</span>
                            </Button>
                          )}
                          
                          {kycData.id_back_url && (
                            <Button 
                              variant="outline" 
                              className="w-full flex items-center justify-between"
                              onClick={() => window.open(getKycDocumentUrl(kycData.id_back_url!), '_blank')}
                            >
                              <span className="flex items-center">
                                <FileText className="mr-2 h-4 w-4" />
                                ID Back Side
                              </span>
                              <span className="text-xs text-blue-500">View</span>
                            </Button>
                          )}
                          
                          {kycData.selfie_url && (
                            <Button 
                              variant="outline" 
                              className="w-full flex items-center justify-between"
                              onClick={() => window.open(getKycDocumentUrl(kycData.selfie_url!), '_blank')}
                            >
                              <span className="flex items-center">
                                <FileText className="mr-2 h-4 w-4" />
                                Selfie
                              </span>
                              <span className="text-xs text-blue-500">View</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No KYC Data Available</h3>
                    <p className="text-gray-500">
                      This user has not completed KYC verification or the KYC data is not linked to this transaction.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="flex justify-between mt-6">
              <Button 
                variant="destructive" 
                onClick={handleConfirmReject}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Decline Transaction
                  </>
                )}
              </Button>
              
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleConfirmApprove}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve Transaction
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default HighValueTransactions;
