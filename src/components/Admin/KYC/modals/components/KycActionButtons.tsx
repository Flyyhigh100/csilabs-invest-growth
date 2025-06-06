
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  MailCheck
} from 'lucide-react';

interface KycActionButtonsProps {
  activeAction: string | null;
  setActiveAction: (action: string | null) => void;
  isPending: boolean;
  showResendEmail?: boolean;
}

const KycActionButtons: React.FC<KycActionButtonsProps> = ({ 
  activeAction, 
  setActiveAction, 
  isPending,
  showResendEmail = false
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        variant={activeAction === 'approve' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setActiveAction(activeAction === 'approve' ? null : 'approve')}
        disabled={isPending}
        className={activeAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Approve
      </Button>
      
      <Button
        variant={activeAction === 'reject' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setActiveAction(activeAction === 'reject' ? null : 'reject')}
        disabled={isPending}
        className={activeAction === 'reject' ? 'bg-rose-600 hover:bg-rose-700' : ''}
      >
        <XCircle className="mr-2 h-4 w-4" />
        Reject
      </Button>
      
      <Button
        variant={activeAction === 'clarify' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setActiveAction(activeAction === 'clarify' ? null : 'clarify')}
        disabled={isPending}
        className={activeAction === 'clarify' ? 'bg-amber-600 hover:bg-amber-700' : ''}
      >
        <HelpCircle className="mr-2 h-4 w-4" />
        Request Clarification
      </Button>

      {showResendEmail && (
        <Button
          variant={activeAction === 'resend' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveAction(activeAction === 'resend' ? null : 'resend')}
          disabled={isPending}
          className={activeAction === 'resend' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          <MailCheck className="mr-2 h-4 w-4" />
          Resend Email
        </Button>
      )}
    </div>
  );
};

export default KycActionButtons;
