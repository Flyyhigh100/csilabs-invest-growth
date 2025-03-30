
import React, { useState } from 'react';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, XCircle, MessageSquare, AlertTriangle 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KycVerificationWithProfile } from './types';

interface KycDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedKyc: KycVerificationWithProfile | null;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  clarificationMessage: string;
  setClarificationMessage: (message: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestClarification: () => void;
  isPending: boolean;
}

const KycDetailModal: React.FC<KycDetailModalProps> = ({
  open,
  onOpenChange,
  selectedKyc,
  rejectionReason,
  setRejectionReason,
  clarificationMessage,
  setClarificationMessage,
  onApprove,
  onReject,
  onRequestClarification,
  isPending
}) => {
  const [activeTab, setActiveTab] = useState<string>('info');
  const [activeAction, setActiveAction] = useState<string | null>(null);

  if (!selectedKyc) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>KYC Verification Details</DialogTitle>
          <DialogDescription>
            Review user information and documents
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="info">Personal Information</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info">
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
          </TabsContent>
          
          <TabsContent value="documents">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedKyc.id_front_url && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">ID Front</p>
                  <a href={selectedKyc.id_front_url} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={selectedKyc.id_front_url} 
                      alt="ID Front" 
                      className="w-full h-48 object-cover rounded-md border border-gray-200" 
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
                      className="w-full h-48 object-cover rounded-md border border-gray-200" 
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
                      className="w-full h-48 object-cover rounded-md border border-gray-200" 
                    />
                  </a>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="history">
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
                {selectedKyc.clarification_message && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-500">Clarification Request:</span>
                    <span className="ml-2">{selectedKyc.clarification_message}</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Action Buttons (only for pending) */}
        {selectedKyc.status === 'pending' && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Process Verification</h3>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Button 
                variant="outline" 
                className={`flex items-center justify-center ${activeAction === 'reject' ? 'bg-red-50 border-red-300' : ''}`}
                onClick={() => setActiveAction(activeAction === 'reject' ? null : 'reject')}
              >
                <XCircle className="mr-1 h-4 w-4" />
                Reject
              </Button>
              
              <Button 
                variant="outline"
                className={`flex items-center justify-center ${activeAction === 'clarify' ? 'bg-blue-50 border-blue-300' : ''}`}
                onClick={() => setActiveAction(activeAction === 'clarify' ? null : 'clarify')}
              >
                <MessageSquare className="mr-1 h-4 w-4" />
                Request Info
              </Button>
              
              <Button 
                variant="outline"
                className={`flex items-center justify-center ${activeAction === 'approve' ? 'bg-green-50 border-green-300' : ''}`}
                onClick={() => setActiveAction(activeAction === 'approve' ? null : 'approve')}
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Approve
              </Button>
            </div>
            
            {activeAction === 'reject' && (
              <div className="mb-4 border-t pt-4">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <h4 className="font-medium text-red-800">Reject Verification</h4>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason (required)
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                />
                <div className="flex justify-end mt-3">
                  <Button 
                    variant="destructive"
                    onClick={onReject}
                    disabled={isPending || !rejectionReason.trim()}
                  >
                    Confirm Rejection
                  </Button>
                </div>
              </div>
            )}
            
            {activeAction === 'clarify' && (
              <div className="mb-4 border-t pt-4">
                <div className="flex items-start gap-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
                  <h4 className="font-medium text-blue-800">Request Additional Information</h4>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Request Details (required)
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  value={clarificationMessage}
                  onChange={(e) => setClarificationMessage(e.target.value)}
                  placeholder="Specify what additional information you need from the user..."
                />
                <div className="flex justify-end mt-3">
                  <Button 
                    onClick={onRequestClarification}
                    disabled={isPending || !clarificationMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Send Request
                  </Button>
                </div>
              </div>
            )}
            
            {activeAction === 'approve' && (
              <div className="mb-4 border-t pt-4">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <h4 className="font-medium text-green-800">Approve Verification</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  You are about to approve this user's KYC verification. This will grant them full access to the platform.
                </p>
                <div className="flex justify-end">
                  <Button 
                    onClick={onApprove}
                    disabled={isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Confirm Approval
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default KycDetailModal;
