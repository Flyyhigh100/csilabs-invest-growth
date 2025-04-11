
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const ManualStatusUpdate: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const form = useForm({
    defaultValues: {
      transactionId: '',
      externalTransactionId: ''
    }
  });

  const handleSubmit = async (data: { transactionId: string; externalTransactionId: string }) => {
    // Validate that at least one ID is provided
    if (!data.transactionId && !data.externalTransactionId) {
      toast.error('Please provide either a Database ID or CoinPayments ID');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Call the admin operation to manually complete the transaction
      toast.info('Processing transaction update...', { id: 'transaction-update' });
      
      const { data: response, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'manuallyCompleteTransaction',
          data: {
            transactionId: data.transactionId || null,
            externalTransactionId: data.externalTransactionId || null
          }
        }
      });

      if (error) {
        console.error('Error updating transaction status:', error);
        toast.dismiss('transaction-update');
        toast.error(`Error: ${error.message || 'Failed to update transaction'}`);
        return;
      }

      toast.dismiss('transaction-update');
      
      if (response.error) {
        console.error('Error response:', response.error);
        toast.error(`Error: ${response.error.message || 'Failed to update transaction'}`);
        setResult({ success: false, message: response.error.message });
        return;
      }

      console.log('Transaction update response:', response);
      setResult(response);
      
      if (response.success) {
        toast.success('Transaction status updated to completed', {
          description: `Transaction ID: ${response.transaction?.id}`
        });
        // Clear the form
        form.reset();
      } else {
        toast.info(response.message || 'No changes were made');
      }
    } catch (err) {
      console.error('Exception updating transaction:', err);
      toast.error(`Error: ${(err as Error).message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manual Transaction Status Update</CardTitle>
        <CardDescription>
          Manually update a CoinPayments transaction status to "completed"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Database Transaction ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. 12345678-1234-5678-1234-567812345678" 
                        {...field} 
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="externalTransactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CoinPayments Transaction ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. CPDA123456ABCDEFG" 
                        {...field} 
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={loading}
                className="px-6"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Update Status'
                )}
              </Button>
            </div>
          </form>
        </Form>

        {result && (
          <div className={`mt-6 p-4 border rounded-md ${result.success ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-start mb-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
              )}
              <span className="font-medium">{result.message}</span>
            </div>
            
            {result.transaction && (
              <div className="mt-3 text-sm space-y-1 pl-7">
                <p><span className="font-medium">Transaction ID:</span> {result.transaction.id}</p>
                {result.previousStatus && (
                  <p><span className="font-medium">Previous status:</span> {result.previousStatus}</p>
                )}
                <p><span className="font-medium">Current status:</span> {result.transaction.status}</p>
                <p><span className="font-medium">Amount:</span> ${result.transaction.amount}</p>
                <p><span className="font-medium">Payment method:</span> {result.transaction.payment_method}</p>
                <p><span className="font-medium">Created at:</span> {new Date(result.transaction.created_at).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManualStatusUpdate;
