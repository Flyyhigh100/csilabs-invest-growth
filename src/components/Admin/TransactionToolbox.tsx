
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import IPNLogViewer from '@/components/Dashboard/Transactions/IPNLogs/IPNLogViewer';
import { AlertCircle } from 'lucide-react';

const TransactionToolbox = () => {
  const [transactionId, setTransactionId] = useState('');
  const [externalId, setExternalId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManualStatusUpdate = async (status: string) => {
    if (!transactionId && !externalId) {
      toast.error('Please enter either a Transaction ID or an External Transaction ID');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('force-update-transaction-status', {
        body: {
          transaction_id: transactionId || null,
          external_transaction_id: externalId || null,
          force_status: status
        }
      });
      
      if (error) {
        console.error('Error updating transaction status:', error);
        toast.error(`Failed to update transaction: ${error.message || 'Unknown error'}`);
        setError(error.message || 'Failed to update transaction status');
        return;
      }
      
      if (data.success) {
        toast.success(`Transaction updated to ${status}`, {
          description: data.message
        });
      } else {
        toast.error('Failed to update transaction', {
          description: data.message || 'Unknown error occurred'
        });
        setError(data.message || 'Failed to update transaction');
      }
      
      console.log('Update response:', data);
    } catch (err) {
      console.error('Exception updating transaction:', err);
      toast.error(`Error: ${(err as Error).message || 'Unknown error'}`);
      setError((err as Error).message || 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForceProcessIPN = async () => {
    if (!externalId) {
      toast.error('Please enter an External Transaction ID to process an IPN for');
      return;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // First find the most recent IPN log for this transaction
      const { data: ipnLogs, error: ipnError } = await (supabase as any)
        .from('ipn_logs')
        .select('*')
        .eq('txn_id', externalId)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (ipnError) {
        console.error('Error fetching IPN logs:', ipnError);
        toast.error(`Failed to fetch IPN logs: ${ipnError.message}`);
        setError(`Failed to fetch IPN logs: ${ipnError.message}`);
        return;
      }
        
      if (!ipnLogs || ipnLogs.length === 0) {
        console.log('No IPN logs found for transaction ID:', externalId);
        toast.error('No IPN logs found for this transaction ID');
        setError(`No IPN logs found for External ID: ${externalId}`);
        
        // Show detailed diagnostic info
        const { data: sampleLogs } = await (supabase as any)
          .from('ipn_logs')
          .select('txn_id')
          .limit(5);
          
        if (sampleLogs && sampleLogs.length > 0) {
          console.log('Available IPN log transaction IDs:', sampleLogs.map((log: any) => log.txn_id));
        } else {
          console.log('No IPN logs exist in the database');
        }
        return;
      }
      
      const ipnLog = ipnLogs[0];
      console.log('Found IPN log to process:', ipnLog.id, 'for transaction:', ipnLog.txn_id);
      
      // Now process this IPN log to update the transaction
      const { data, error } = await supabase.functions.invoke('process-ipn-log', {
        body: {
          ipn_log_id: ipnLog.id,
          force_process: true
        }
      });
      
      if (error) {
        console.error('Error processing IPN log:', error);
        toast.error(`Failed to process IPN: ${error.message || 'Unknown error'}`);
        setError(`Failed to process IPN: ${error.message}`);
        return;
      }
      
      if (data.success) {
        toast.success('IPN processed successfully', {
          description: data.message
        });
      } else {
        toast.error('Failed to process IPN', {
          description: data.message || 'Unknown error occurred'
        });
        setError(data.message || 'Failed to process IPN');
      }
      
      console.log('IPN processing response:', data);
    } catch (err) {
      console.error('Exception processing IPN:', err);
      toast.error(`Error: ${(err as Error).message || 'Unknown error'}`);
      setError((err as Error).message || 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  // Query to check if IPN logs exist at all
  const { data: ipnLogsExist } = useQuery({
    queryKey: ['ipn-logs-exist-check'],
    queryFn: async () => {
      const { count, error } = await (supabase as any)
        .from('ipn_logs')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count > 0;
    },
    refetchInterval: 60000, // Check every minute
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Toolbox</CardTitle>
        <CardDescription>
          Advanced tools for managing and troubleshooting transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="manual-update" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="manual-update">Manual Status Update</TabsTrigger>
            <TabsTrigger value="ipn-logs">IPN Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual-update" className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <div>
                    <h3 className="font-medium">Error</h3>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transaction-id">Internal Transaction ID</Label>
                <Input
                  id="transaction-id"
                  placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="external-id">External Transaction ID</Label>
                <Input
                  id="external-id"
                  placeholder="CoinPayments transaction ID"
                  value={externalId}
                  onChange={(e) => setExternalId(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Button 
                onClick={() => handleManualStatusUpdate('pending')} 
                variant="outline"
                disabled={isProcessing}
              >
                Set Pending
              </Button>
              <Button 
                onClick={() => handleManualStatusUpdate('confirmed')} 
                variant="outline" 
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                disabled={isProcessing}
              >
                Set Confirmed
              </Button>
              <Button 
                onClick={() => handleManualStatusUpdate('completed')} 
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                disabled={isProcessing}
              >
                Set Completed
              </Button>
              <Button 
                onClick={() => handleManualStatusUpdate('failed')} 
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                disabled={isProcessing}
              >
                Set Failed
              </Button>
              <Button 
                onClick={handleForceProcessIPN} 
                variant="default"
                className="ml-auto"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Force Process IPN'}
              </Button>
            </div>
            
            {!ipnLogsExist && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                <p className="font-medium">No IPN logs found in database</p>
                <p>Before using Force Process IPN, ensure that IPN logs exist in your database.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ipn-logs">
            <IPNLogViewer />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TransactionToolbox;
