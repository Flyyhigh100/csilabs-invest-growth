
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface KycRejectFormProps {
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  onReject: () => void;
  isPending: boolean;
}

const KycRejectForm: React.FC<KycRejectFormProps> = ({
  rejectionReason,
  setRejectionReason,
  onReject,
  isPending
}) => {
  // Handle keyboard submission (Ctrl/Cmd + Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && rejectionReason.trim()) {
      e.preventDefault(); // Prevent any default behavior
      if (!isPending) {
        onReject();
      }
    }
  };

  const handleRejectClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (rejectionReason.trim() && !isPending) {
      onReject();
    }
  };

  return (
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
        disabled={isPending}
        onKeyDown={handleKeyDown}
      />
      <div className="flex justify-end mt-3">
        <Button 
          variant="destructive"
          onClick={handleRejectClick}
          disabled={isPending || !rejectionReason.trim()}
          type="button"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Confirm Rejection"
          )}
        </Button>
      </div>
    </div>
  );
};

export default KycRejectForm;
