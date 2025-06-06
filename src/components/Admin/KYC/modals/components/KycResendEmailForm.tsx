
import React from 'react';
import { Button } from '@/components/ui/button';
import { MailCheck, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface KycResendEmailFormProps {
  onResendEmail: () => void;
  isPending: boolean;
  lastSentStatus?: {
    success: boolean;
    timestamp: string | null;
    error?: string;
  } | null;
}

const KycResendEmailForm: React.FC<KycResendEmailFormProps> = ({
  onResendEmail,
  isPending,
  lastSentStatus
}) => {
  return (
    <div className="space-y-4 mt-2">
      <div className="bg-slate-50 p-4 rounded-md">
        <h3 className="font-medium mb-2">Resend Notification Email</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Manually resend the notification email for this KYC verification.
          Use this option if the user reports not receiving the email or if there was an error sending it.
        </p>
        
        {lastSentStatus && (
          <Alert 
            variant={lastSentStatus.success ? "default" : "destructive"}
            className={`mb-4 ${lastSentStatus.success ? "bg-emerald-50 text-emerald-800 border-emerald-200" : ""}`}
          >
            <AlertDescription>
              {lastSentStatus.success 
                ? `Email sent successfully at ${new Date(lastSentStatus.timestamp || '').toLocaleString()}` 
                : `Failed to send email: ${lastSentStatus.error || 'Unknown error'}`}
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={onResendEmail}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <MailCheck className="mr-2 h-4 w-4" />
              Send Notification Email
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default KycResendEmailForm;
