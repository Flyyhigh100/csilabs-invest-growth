
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, XCircle, AlertTriangle, 
  RefreshCw, Eye, User, FileCheck 
} from 'lucide-react';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { processKycVerification } from '@/utils/adminUtils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { KycVerificationData } from '@/hooks/useKycVerification';
import { Database } from '@/integrations/supabase/types';

type KycStatus = Database['public']['Enums']['kyc_status'];

// Define an enhanced KYC type that includes profile data
interface KycVerificationWithProfile extends KycVerificationData {
  profile_first_name?: string | null;
  profile_last_name?: string | null;
}

// Fetch KYC verifications function
const fetchKycVerifications = async (): Promise<KycVerificationWithProfile[]> => {
  console.log('Fetching KYC verifications from database');
  
  // First, get all KYC verifications
  const { data: kycData, error: kycError } = await supabase
    .from('kyc_verifications')
    .select('*')
    .order('submitted_at', { ascending: false });
  
  if (kycError) {
    console.error('Error fetching KYC verifications:', kycError);
    throw kycError;
  }
  
  // Then, for each KYC verification, fetch the associated profile data
  const enhancedKycData: KycVerificationWithProfile[] = await Promise.all(
    (kycData || []).map(async (kyc) => {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', kyc.user_id)
        .maybeSingle();
      
      if (profileError) {
        console.error(`Error fetching profile for user ${kyc.user_id}:`, profileError);
      }
      
      return {
        ...kyc,
        profile_first_name: profileData?.first_name || null,
        profile_last_name: profileData?.last_name || null
      };
    })
  );
  
  console.log('KYC verifications fetched:', enhancedKycData.length || 0);
  return enhancedKycData;
};

// Component for the KYC verifications admin page
const KycVerifications = () => {
  const queryClient = useQueryClient();
  const [selectedKyc, setSelectedKyc] = useState<KycVerificationWithProfile | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Fetch KYC verifications
  const { 
    data: kycVerifications = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-kyc-verifications'],
    queryFn: fetchKycVerifications,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Filter verifications based on active tab
  const filteredVerifications = kycVerifications.filter(verification => {
    if (activeTab === 'pending') return verification.status === 'pending';
    if (activeTab === 'approved') return verification.status === 'approved';
    if (activeTab === 'rejected') return verification.status === 'rejected';
    if (activeTab === 'all') return true;
    return false;
  });
  
  // Process KYC verification (approve or reject)
  const processMutation = useMutation({
    mutationFn: ({ 
      kycId, 
      status, 
      rejectionReason 
    }: { 
      kycId: string; 
      status: 'approved' | 'rejected'; 
      rejectionReason?: string;
    }) => {
      return processKycVerification(kycId, status, rejectionReason);
    },
    onSuccess: () => {
      setIsViewModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      toast.success(`KYC verification processed successfully`);
    },
    onError: (error) => {
      console.error('Error processing KYC verification:', error);
      toast.error('Failed to process KYC verification');
    },
  });
  
  // Handle view verification details
  const handleViewDetails = (kyc: KycVerificationWithProfile) => {
    setSelectedKyc(kyc);
    setIsViewModalOpen(true);
  };
  
  // Handle approve verification
  const handleApprove = () => {
    if (!selectedKyc) return;
    
    processMutation.mutate({
      kycId: selectedKyc.id,
      status: 'approved'
    });
  };
  
  // Handle reject verification
  const handleReject = () => {
    if (!selectedKyc || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    processMutation.mutate({
      kycId: selectedKyc.id,
      status: 'rejected',
      rejectionReason: rejectionReason.trim()
    });
  };
  
  useEffect(() => {
    // Force refetch when component mounts to ensure fresh data
    refetch();
    
    // Clear rejection reason when modal is closed
    if (!isViewModalOpen) {
      setRejectionReason('');
    }
  }, [isViewModalOpen, refetch]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cbis-blue"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <h3 className="font-bold">Error loading KYC verifications</h3>
        <p>{(error as Error).message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">KYC Verifications</h3>
        <Button variant="outline" onClick={() => refetch()} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification Requests</CardTitle>
          <CardDescription>
            Review and approve or reject KYC verification requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                Pending
                {kycVerifications.filter(v => v.status === 'pending').length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {kycVerifications.filter(v => v.status === 'pending').length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {filteredVerifications.length === 0 ? (
                <div className="text-center py-8">
                  <FileCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No {activeTab} verifications
                  </h3>
                  <p className="text-gray-500">
                    {activeTab === 'pending' 
                      ? 'There are no pending KYC verification requests at this time.' 
                      : `No ${activeTab} KYC verifications found.`}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Submitted</TableHead>
                      <TableHead>Date Reviewed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVerifications.map((verification) => (
                      <TableRow key={verification.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="bg-gray-100 p-1.5 rounded-full">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {verification.first_name} {verification.last_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {verification.profile_first_name} {verification.profile_last_name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {verification.status === 'pending' && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              <AlertTriangle className="h-3 w-3 mr-1" /> Pending
                            </Badge>
                          )}
                          {verification.status === 'approved' && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" /> Approved
                            </Badge>
                          )}
                          {verification.status === 'rejected' && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              <XCircle className="h-3 w-3 mr-1" /> Rejected
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {verification.submitted_at 
                            ? formatDistanceToNow(new Date(verification.submitted_at), { addSuffix: true })
                            : 'Not submitted'}
                        </TableCell>
                        <TableCell>
                          {verification.reviewed_at 
                            ? formatDistanceToNow(new Date(verification.reviewed_at), { addSuffix: true })
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center gap-1"
                            onClick={() => handleViewDetails(verification)}
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* View/Process KYC Verification Modal */}
      {selectedKyc && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>KYC Verification Details</DialogTitle>
              <DialogDescription>
                Review user information and documents
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 grid gap-6">
              {/* User Information Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">First Name</p>
                    <p>{selectedKyc.first_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Name</p>
                    <p>{selectedKyc.last_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                    <p>{selectedKyc.date_of_birth || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nationality</p>
                    <p>{selectedKyc.nationality || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p>{selectedKyc.address || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">City</p>
                    <p>{selectedKyc.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Postal Code</p>
                    <p>{selectedKyc.postal_code || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Country</p>
                    <p>{selectedKyc.country || '-'}</p>
                  </div>
                </div>
              </div>
              
              {/* Documents Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Verification Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedKyc.id_front_url && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">ID Front</p>
                      <a href={selectedKyc.id_front_url} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={selectedKyc.id_front_url} 
                          alt="ID Front" 
                          className="w-full h-40 object-cover rounded-md border border-gray-200" 
                        />
                      </a>
                    </div>
                  )}
                  
                  {selectedKyc.id_back_url && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">ID Back</p>
                      <a href={selectedKyc.id_back_url} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={selectedKyc.id_back_url} 
                          alt="ID Back" 
                          className="w-full h-40 object-cover rounded-md border border-gray-200" 
                        />
                      </a>
                    </div>
                  )}
                  
                  {selectedKyc.selfie_url && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Selfie with ID</p>
                      <a href={selectedKyc.selfie_url} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={selectedKyc.selfie_url} 
                          alt="Selfie with ID" 
                          className="w-full h-40 object-cover rounded-md border border-gray-200" 
                        />
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Meta Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Status:</span>
                    <span className="ml-2 capitalize">{selectedKyc.status}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Submitted:</span>
                    <span className="ml-2">
                      {selectedKyc.submitted_at 
                        ? new Date(selectedKyc.submitted_at).toLocaleString() 
                        : 'Not submitted'}
                    </span>
                  </div>
                  {selectedKyc.reviewed_at && (
                    <div className="col-span-2">
                      <span className="font-medium text-gray-500">Reviewed:</span>
                      <span className="ml-2">
                        {new Date(selectedKyc.reviewed_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedKyc.rejection_reason && (
                    <div className="col-span-2">
                      <span className="font-medium text-gray-500">Rejection Reason:</span>
                      <span className="ml-2">{selectedKyc.rejection_reason}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons (only for pending) */}
              {selectedKyc.status === 'pending' && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Process Verification</h3>
                  
                  {/* Rejection reason input (only shown when rejecting) */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rejection Reason (required if rejecting)
                    </label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a reason for rejection..."
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsViewModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={handleReject}
                      disabled={processMutation.isPending || !rejectionReason.trim()}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                    <Button 
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleApprove}
                      disabled={processMutation.isPending}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default KycVerifications;
