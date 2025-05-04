
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  txn_id: z.string().min(1, "Transaction ID is required"),
  status: z.string().min(1, "Status is required"),
});

const TestIPNForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      txn_id: '',
      status: '100'
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Create the IPN payload similar to what CoinPayments would send
      const ipnPayload = {
        ipn_version: '1.0',
        ipn_type: 'api',
        ipn_mode: 'hmac',
        ipn_id: `TEST_${Date.now()}`,
        merchant: 'test_merchant',
        txn_id: values.txn_id,
        status: values.status,
        status_text: getStatusText(values.status),
        currency1: 'USD',
        currency2: 'BTC',
        amount1: '100.00',
        amount2: '0.01',
        fee: '0.001',
        buyer_name: 'Test User',
        received_amount: '0.01',
        received_confirms: '3'
      };
      
      toast.info("Sending test IPN webhook...");
      
      // Call the test IPN webhook function
      const { data, error } = await supabase.functions.invoke('test-ipn-webhook', {
        body: ipnPayload
      });
      
      if (error) {
        toast.error(`Error: ${error.message || 'Unknown error'}`);
        setResult({ success: false, error: error.message });
      } else {
        console.log("Test IPN response:", data);
        setResult(data);
        
        if (data?.success) {
          toast.success("Test IPN processed successfully", {
            description: data.message
          });
        } else {
          toast.warning("IPN request sent but processing failed", {
            description: data?.message || "Unknown error"
          });
        }
      }
    } catch (error) {
      console.error("Error sending test IPN:", error);
      toast.error("Failed to send test IPN");
      setResult({ success: false, error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      '-1': 'Cancelled/Timed Out',
      '0': 'Pending',
      '1': 'Payment Received',
      '2': 'Complete',
      '100': 'Complete (From API)'
    };
    
    return statusMap[status] || `Unknown Status (${status})`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test CoinPayments IPN Webhook</CardTitle>
        <CardDescription>
          Send a test IPN notification to simulate a payment status update
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="txn_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External Transaction ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the transaction's external_transaction_id" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="-1">-1: Cancelled/Timed Out</SelectItem>
                      <SelectItem value="0">0: Pending</SelectItem>
                      <SelectItem value="1">1: Payment Received</SelectItem>
                      <SelectItem value="2">2: Complete</SelectItem>
                      <SelectItem value="100">100: Complete (From API)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Test IPN'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      
      {result && (
        <CardFooter className="flex-col items-start border-t pt-4">
          <h4 className="font-medium mb-2">Result:</h4>
          <pre className="bg-slate-100 p-4 rounded w-full overflow-x-auto text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </CardFooter>
      )}
    </Card>
  );
};

export default TestIPNForm;
