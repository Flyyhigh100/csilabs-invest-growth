
import React from 'react';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { KycVerificationWithProfile } from './types';

interface KycDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedKyc: KycVerificationWithProfile | null;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  onApprove: () => void;
  onReject: () => void;
  isPending: boolean;
}

const KycDetailModal: React.FC<KycDetailModalProps> = ({
  open,
  onOpenChange,
  selectedKyc,
  rejectionReason,
  setRejectionReason,
  onApprove,
  onReject,
  isPending
}) => {
  if (!selectedKyc) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={onReject}
                  disabled={isPending || !rejectionReason.trim()}
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Reject
                </Button>
                <Button 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={onApprove}
                  disabled={isPending}
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
  );
};

export default KycDetailModal;
