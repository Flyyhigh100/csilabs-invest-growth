
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Eye, CheckCircle, XCircle, AlertTriangle, 
  Clock, Loader2, RefreshCw 
} from 'lucide-react';
import { processKycVerification } from '@/utils/adminUtils';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type KycStatus = Database['public']['Enums']['kyc_status'];

interface KycVerification {
  id: string;
  user_id: string;
  status: KycStatus;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  id_front_url: string | null;
  id_back_url: string | null;
  selfie_url: string | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
}

interface ProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  wallet_address: string | null;
  email?: string;
}

const fetchKycVerifications = async (): Promise<KycVerification[]> => {
  // Only fetch pending KYC verifications for the admin dashboard
  const { data, error } = await supabase
    .from('kyc_verifications')
    .select('*')
    .order('submitted_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

const fetchUserProfile = async (userId: string): Promise<ProfileData | null> => {
  // Fetch user profile data
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
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

const KycVerifications: React.FC = () => {
  const [selectedKyc, setSelectedKyc] = useState<KycVerification | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const {
    data: kycVerifications,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-kyc-verifications'],
    queryFn: fetchKycVerifications,
  });
  
  // Filter for pending verifications
  const pendingVerifications = kycVerifications?.filter(kyc => kyc.status === 'pending') || [];
  
  // Count by status
  const statusCounts = kycVerifications?.reduce((acc, kyc) => {
    acc[kyc.status] = (acc[kyc.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
  
  useEffect(() => {
    if (selectedKyc?.user_id) {
      fetchUserProfile(selectedKyc.user_id).then(setUserProfile);
    }
  }, [selectedKyc]);
  
  const handleView = (kyc: KycVerification) => {
    setSelectedKyc(kyc);
    setViewDialogOpen(true);
  };
  
  const handleApproveClick = (kyc: KycVerification) => {
    setSelectedKyc(kyc);
    setApproveDialogOpen(true);
  };
  
  const handleRejectClick = (kyc: KycVerification) => {
    setSelectedKyc(kyc);
    setRejectDialogOpen(true);
  };
  
  const handleApprove = async () => {
    if (!selectedKyc) return;
    
    setIsProcessing(true);
    const success = await processKycVerification(selectedKyc.id, 'approved');
    setIsProcessing(false);
    
    if (success) {
      setApproveDialogOpen(false);
      refetch();
    }
  };
  
  const handleReject = async () => {
    if (!selectedKyc) return;
    
    setIsProcessing(true);
    const success = await processKycVerification(
      selectedKyc.id, 
      'rejected', 
      rejectionReason
    );
    setIsProcessing(false);
    
    if (success) {
      setRejectDialogOpen(false);
      setRejectionReason('');
      refetch();
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-cbis-blue" />
        <span className="ml-2">Loading KYC verifications...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <h3 className="font-bold">Error loading KYC verifications</h3>
        <p>{(error as Error).message}</p>
      </div>
    );
  }
  
  const renderStatusBadge = (status: KycStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kycVerifications?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statusCounts.pending || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.approved || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statusCounts.rejected || 0}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">KYC Verifications</h3>
        <Button variant="outline" onClick={() => refetch()} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      {pendingVerifications.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pending Verifications</CardTitle>
            <CardDescription>Review and process pending KYC verifications</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingVerifications.map((kyc) => (
                  <TableRow key={kyc.id}>
                    <TableCell className="font-medium">
                      {kyc.first_name} {kyc.last_name}
                    </TableCell>
                    <TableCell>
                      {kyc.submitted_at ? new Date(kyc.submitted_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>{renderStatusBadge(kyc.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(kyc)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="default" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveClick(kyc)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="default" 
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleRejectClick(kyc)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Pending Verifications</h3>
            <p className="text-gray-500">
              All KYC verifications have been processed. Check back later for new submissions.
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* All Verifications */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>All Verifications</CardTitle>
          <CardDescription>Complete history of KYC verifications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Review Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kycVerifications?.map((kyc) => (
                <TableRow key={kyc.id}>
                  <TableCell className="font-medium">
                    {kyc.first_name} {kyc.last_name}
                  </TableCell>
                  <TableCell>
                    {kyc.submitted_at ? new Date(kyc.submitted_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {kyc.reviewed_at ? new Date(kyc.reviewed_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>{renderStatusBadge(kyc.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleView(kyc)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* View KYC Dialog */}
      {selectedKyc && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>KYC Verification Details</DialogTitle>
              <DialogDescription>
                Reviewing verification for {selectedKyc.first_name} {selectedKyc.last_name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      {selectedKyc.first_name} {selectedKyc.last_name}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Email</Label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      {userProfile?.email || 'Not available'}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Date of Birth</Label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      {selectedKyc.date_of_birth || 'Not provided'}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Nationality</Label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      {selectedKyc.nationality || 'Not provided'}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Address</Label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      {selectedKyc.address || 'Not provided'}
                      {selectedKyc.city && `, ${selectedKyc.city}`}
                      {selectedKyc.postal_code && `, ${selectedKyc.postal_code}`}
                      {selectedKyc.country && `, ${selectedKyc.country}`}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Wallet Address</Label>
                    <div className="p-2 bg-gray-50 rounded-md font-mono text-sm break-all">
                      {userProfile?.wallet_address || 'Not provided'}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Status</Label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      {renderStatusBadge(selectedKyc.status)}
                      {selectedKyc.rejection_reason && (
                        <div className="mt-2 text-red-600 text-sm">
                          Reason: {selectedKyc.rejection_reason}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Verification Documents</h3>
                <div className="space-y-4">
                  {selectedKyc.id_front_url && (
                    <div>
                      <Label>ID Front</Label>
                      <div className="mt-1 border rounded-md overflow-hidden">
                        <img 
                          src={selectedKyc.id_front_url} 
                          alt="ID Front" 
                          className="w-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                  
                  {selectedKyc.id_back_url && (
                    <div>
                      <Label>ID Back</Label>
                      <div className="mt-1 border rounded-md overflow-hidden">
                        <img 
                          src={selectedKyc.id_back_url} 
                          alt="ID Back" 
                          className="w-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                  
                  {selectedKyc.selfie_url && (
                    <div>
                      <Label>Selfie</Label>
                      <div className="mt-1 border rounded-md overflow-hidden">
                        <img 
                          src={selectedKyc.selfie_url} 
                          alt="Selfie" 
                          className="w-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {selectedKyc.status === 'pending' && (
              <DialogFooter className="flex justify-between sm:justify-end gap-2 mt-6">
                <Button 
                  variant="default" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setViewDialogOpen(false);
                    setApproveDialogOpen(true);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button 
                  variant="default" 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    setViewDialogOpen(false);
                    setRejectDialogOpen(true);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}
      
      {/* Approve KYC Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve KYC Verification</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this KYC verification?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              Approving will grant the user full access to the platform.
            </p>
            <div className="flex items-center p-4 bg-green-50 text-green-700 rounded-md">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>User: {selectedKyc?.first_name} {selectedKyc?.last_name}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove} 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Approval
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject KYC Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this KYC verification.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center p-4 mb-4 bg-red-50 text-red-700 rounded-md">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>User: {selectedKyc?.first_name} {selectedKyc?.last_name}</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea 
                id="reason"
                placeholder="Enter reason for rejection"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Confirm Rejection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KycVerifications;
