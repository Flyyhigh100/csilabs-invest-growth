import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface IPNLog {
  id: string;
  created_at: string;
  provider: string;
  txn_id: string;
  is_valid: boolean;
  status?: string;
  raw_data?: any;
  hmac_header?: string;
  processing_status?: string;
  processed_at?: string;
  details?: string;
}

interface IPNLogViewerProps {
  transactionId?: string;
  externalTransactionId?: string;
  compact?: boolean;
  className?: string;
}

const IPNLogViewer: React.FC<IPNLogViewerProps> = ({ 
  transactionId,
  externalTransactionId,
  compact = false,
  className = ''
}) => {
  const [logs, setLogs] = useState<IPNLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchLogs = async () => {
    if (!transactionId && !externalTransactionId) {
      setError('No transaction ID provided');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      let query = supabase
        .from('ipn_logs')
        .select('*')
        .order('created_at', { ascending: false });
        
      // If we have an external transaction ID, use that
      if (externalTransactionId) {
        query = query.eq('txn_id', externalTransactionId);
      }
      
      // Otherwise check for logs where the raw_data contains the transaction ID
      // This is a fallback and less reliable
      else if (transactionId) {
        const { data: transaction } = await supabase
          .from('transactions')
          .select('external_transaction_id')
          .eq('id', transactionId)
          .maybeSingle();
          
        if (transaction?.external_transaction_id) {
          query = query.eq('txn_id', transaction.external_transaction_id);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching IPN logs:', err);
      setError('Failed to load IPN logs');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process an IPN log manually
  const handleProcessLog = async (logId: string) => {
    try {
      const toastId = toast.loading('Processing IPN log...');
      
      const { data, error } = await supabase.functions.invoke('process-ipn-log', {
        body: { 
          ipn_log_id: logId,
          force_process: true
        }
      });
      
      toast.dismiss(toastId);
      
      if (error) {
        console.error('Error processing IPN log:', error);
        toast.error('Failed to process IPN log', {
          description: error.message
        });
        return;
      }
      
      if (data?.success) {
        toast.success('IPN log processed successfully', {
          description: data.message
        });
        // Refresh logs
        fetchLogs();
      } else {
        toast.error('Failed to process IPN log', {
          description: data?.message || 'Unknown error'
        });
      }
    } catch (err) {
      console.error('Exception processing IPN log:', err);
      toast.error('Failed to process IPN log');
    }
  };

  useEffect(() => {
    if (transactionId || externalTransactionId) {
      fetchLogs();
    }
  }, [transactionId, externalTransactionId]);

  if (!transactionId && !externalTransactionId) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            No transaction ID provided
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className={compact ? "pb-2 pt-4" : "pb-2"}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={compact ? "text-base" : "text-lg"}>IPN Notifications</CardTitle>
            <CardDescription>
              {externalTransactionId ? `For transaction: ${externalTransactionId}` : 'Payment webhook logs'}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchLogs} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            <AlertCircle className="h-5 w-5 mx-auto mb-2" />
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <AlertCircle className="h-5 w-5 mx-auto mb-2" />
            No IPN logs found for this transaction
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className="border rounded-md p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant={log.is_valid ? 'success' : 'destructive'}>
                        {log.is_valid ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Valid</>
                        ) : (
                          <><XCircle className="h-3 w-3 mr-1" /> Invalid</>
                        )}
                      </Badge>
                      <Badge variant="outline">
                        {log.provider || 'Unknown'}
                      </Badge>
                      {log.status && (
                        <Badge variant="secondary">
                          Status: {log.status}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                  
                  {!log.processing_status || log.processing_status === 'unprocessed' ? (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleProcessLog(log.id)}
                    >
                      Process
                    </Button>
                  ) : (
                    <Badge variant={log.processing_status === 'processed' ? 'outline' : 'secondary'}>
                      {log.processing_status.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                
                {!compact && log.raw_data && (
                  <div className="mt-2">
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        View raw data
                      </summary>
                      <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(log.raw_data, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 text-xs text-gray-500 flex justify-between">
        <div>
          {logs.length > 0 ? `${logs.length} IPN notification(s)` : 'No notifications received'}
        </div>
        {externalTransactionId && (
          <a 
            href={`https://www.coinpayments.net/index.php?cmd=acct_txns&txn_id=${externalTransactionId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            View on CoinPayments <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        )}
      </CardFooter>
    </Card>
  );
};

export default IPNLogViewer;
