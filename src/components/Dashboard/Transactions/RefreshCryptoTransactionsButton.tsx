
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCryptoStatusCheck } from '@/hooks/payments/crypto';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';

interface RefreshCryptoTransactionsButtonProps {
  onRefreshComplete?: () => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  forceUpdateAll?: boolean;
}

// Type definition for API diagnostics state
interface ApiDiagnostics {
  isChecking: boolean;
  isValid?: boolean;
  message: string;
  details: Record<string, string> | null;
}

const RefreshCryptoTransactionsButton = ({ 
  onRefreshComplete,
  size = 'default',
  variant = 'default',
  forceUpdateAll = false
}: RefreshCryptoTransactionsButtonProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [showDiagnosticDialog, setShowDiagnosticDialog] = useState(false);
  const [showAPIIssueDialog, setShowAPIIssueDialog] = useState(false);
  const [apiDiagnostics, setApiDiagnostics] = useState<ApiDiagnostics>({
    isChecking: false,
    message: '',
    details: null
  });
  
  const { refreshAllPendingTransactions } = useCryptoStatusCheck();
  
  const handleRefresh = async () => {
    try {
      setIsChecking(true);
      const success = await refreshAllPendingTransactions(forceUpdateAll);
      
      if (success && onRefreshComplete) {
        onRefreshComplete();
      }
    } catch (err: any) {
      console.error('Error refreshing crypto transactions:', err);
      
      // Check if this is potentially an API key issue
      if (err.message && (
        err.message.includes('API key') || 
        err.message.includes('authentication') ||
        err.message.includes('credentials') ||
        err.message.includes('permission')
      )) {
        setShowAPIIssueDialog(true);
      } else {
        toast.error('Error refreshing transactions', {
          description: err.message || 'Please try again later'
        });
      }
    } finally {
      setIsChecking(false);
    }
  };

  const runApiDiagnostics = async () => {
    try {
      setApiDiagnostics({
        isChecking: true,
        message: 'Checking CoinPayments API keys...',
        details: null
      });
      
      const { data, error } = await supabase.functions.invoke('validate-api-keys', {
        body: { service: 'coinpayments' }
      });
      
      if (error) {
        setApiDiagnostics({
          isChecking: false,
          isValid: false,
          message: `Error validating API keys: ${error.message || 'Unknown error'}`,
          details: null
        });
        return;
      }
      
      setApiDiagnostics({
        isChecking: false,
        isValid: data.isValid,
        message: data.details,
        details: data.rawResponse || null
      });
    } catch (err: any) {
      setApiDiagnostics({
        isChecking: false,
        isValid: false,
        message: `Exception: ${err.message || 'Unknown error'}`,
        details: null
      });
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleRefresh}
        disabled={isChecking}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
        {isChecking ? 'Checking...' : forceUpdateAll ? 'Force Resync All' : 'Sync Crypto Payments'}
      </Button>
      
      {/* API Key Issue Alert Dialog */}
      <AlertDialog
        open={showAPIIssueDialog}
        onOpenChange={setShowAPIIssueDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              API Key Issue Detected
            </AlertDialogTitle>
            <AlertDialogDescription>
              There might be an issue with your CoinPayments API keys or configuration. Would you like to run a diagnostic check?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowAPIIssueDialog(false);
              setShowDiagnosticDialog(true);
              runApiDiagnostics();
            }}>
              Run Diagnostics
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Diagnostic Results Dialog */}
      <Dialog open={showDiagnosticDialog} onOpenChange={setShowDiagnosticDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>API Diagnostics</DialogTitle>
            <DialogDescription>
              Results from checking your CoinPayments API configuration
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {apiDiagnostics?.isChecking ? (
              <div className="flex items-center gap-2 text-amber-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{apiDiagnostics.message}</span>
              </div>
            ) : apiDiagnostics?.isValid ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2 text-green-600">
                  <div className="mt-0.5">
                    <RefreshCw className="h-4 w-4" />
                  </div>
                  <span>{apiDiagnostics.message}</span>
                </div>
                
                {apiDiagnostics.details && (
                  <div className="bg-gray-50 p-3 rounded border text-sm">
                    <p className="font-medium mb-1">Account Information:</p>
                    <ul className="space-y-1">
                      {apiDiagnostics.details && Object.entries(apiDiagnostics.details).map(([key, value]: [string, any]) => (
                        <li key={key} className="flex items-center gap-2">
                          <span className="font-medium">{key.replace(/_/g, ' ')}:</span>
                          <span>{String(value)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <p className="text-sm text-gray-600">
                  Your API keys are configured correctly. If you're still experiencing issues,
                  please check your CoinPayments account settings or contact support.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-2 text-red-600">
                  <div className="mt-0.5">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <span>{apiDiagnostics?.message || 'API validation failed.'}</span>
                </div>
                
                <div className="bg-red-50 p-3 rounded border text-sm">
                  <p className="font-medium">Common issues:</p>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>API keys not properly configured in environment variables</li>
                    <li>API keys have incorrect format</li>
                    <li>API keys don't have proper permissions</li>
                    <li>CoinPayments account is restricted or suspended</li>
                  </ul>
                </div>
                
                <p className="text-sm text-gray-600">
                  Please check your API key configuration in the Supabase secrets and ensure
                  they have the correct permissions in your CoinPayments account.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDiagnosticDialog(false)}
            >
              Close
            </Button>
            
            {!apiDiagnostics?.isChecking && (
              <Button
                onClick={runApiDiagnostics}
              >
                Run Again
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RefreshCryptoTransactionsButton;
