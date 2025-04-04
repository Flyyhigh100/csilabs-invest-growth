
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react';

interface KycActionButtonsProps {
  activeAction: string | null;
  setActiveAction: (action: string | null) => void;
  isPending: boolean;
}

const KycActionButtons: React.FC<KycActionButtonsProps> = ({
  activeAction,
  setActiveAction,
  isPending
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      <Button 
        variant="outline" 
        className={`flex items-center justify-center ${activeAction === 'reject' ? 'bg-red-50 border-red-300' : ''}`}
        onClick={() => setActiveAction(activeAction === 'reject' ? null : 'reject')}
        disabled={isPending}
      >
        <XCircle className="mr-1 h-4 w-4" />
        Reject
      </Button>
      
      <Button 
        variant="outline"
        className={`flex items-center justify-center ${activeAction === 'clarify' ? 'bg-blue-50 border-blue-300' : ''}`}
        onClick={() => setActiveAction(activeAction === 'clarify' ? null : 'clarify')}
        disabled={isPending}
      >
        <MessageSquare className="mr-1 h-4 w-4" />
        Request Info
      </Button>
      
      <Button 
        variant="outline"
        className={`flex items-center justify-center ${activeAction === 'approve' ? 'bg-green-50 border-green-300' : ''}`}
        onClick={() => setActiveAction(activeAction === 'approve' ? null : 'approve')}
        disabled={isPending}
      >
        <CheckCircle className="mr-1 h-4 w-4" />
        Approve
      </Button>
    </div>
  );
};

export default KycActionButtons;
