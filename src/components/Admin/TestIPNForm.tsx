import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

// Define the form schema
const formSchema = z.object({
  txn_id: z.string().min(1, {
    message: "Transaction ID is required"
  }),
  status: z.string().min(1, {
    message: "Status is required"
  }),
  ipn_type: z.string().default('api'),
  ipn_mode: z.string().default('hmac'),
  ipn_version: z.string().default('1.0'),
  merchant: z.string().optional(),
  ipn_id: z.string().optional(),
  fee: z.string().optional(),
  fiat_coin: z.string().optional().default('USD'),
  fiat_amount: z.string().optional(),
  coin: z.string().optional().default('BTC'),
  amount: z.string().optional(),
  custom: z.string().optional(),
  raw_json: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const statusOptions = [
  { value: "-1", label: "-1: Error/Canceled" },
  { value: "0", label: "0: Pending" },
  { value: "1", label: "1: Partial Payment" },
  { value: "2", label: "2: Complete" },
  { value: "3", label: "3: Confirmed (3+ confirmations)" },
  { value: "100", label: "100: Complete/Confirmed" },
];

const TestIPNForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      txn_id: '',
      status: '2',
      ipn_type: 'api',
      ipn_mode: 'hmac',
      ipn_version: '1.0',
      merchant: 'your_merchant_id',
      ipn_id: `test_ipn_${Date.now()}`,
      fee: '0.001',
      fiat_coin: 'USD',
      fiat_amount: '100.00',
      coin: 'BTC',
      amount: '0.0025',
      custom: '',
      raw_json: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setResult(null);
    
    try {
      toast.info("Sending test IPN notification...");

      // If raw_json is provided, use it instead of form fields
      let requestBody: any;
      
      if (data.raw_json) {
        try {
          requestBody = JSON.parse(data.raw_json);
        } catch (e) {
          toast.error("Invalid JSON in raw JSON field");
          setIsSubmitting(false);
          return;
        }
      } else {
        // Otherwise use the form fields
        requestBody = {
          ipn_type: data.ipn_type,
          ipn_mode: data.ipn_mode,
          ipn_version: data.ipn_version,
          merchant: data.merchant,
          ipn_id: data.ipn_id || `test_ipn_${Date.now()}`,
          txn_id: data.txn_id,
          status: data.status,
          status_text: statusOptions.find(s => s.value === data.status)?.label.split(': ')[1] || 'Unknown',
          fee: data.fee,
          fiat_coin: data.fiat_coin,
          fiat_amount: data.fiat_amount,
          coin: data.coin,
          amount: data.amount,
          custom: data.custom
        };
      }
      
      console.log('Sending test IPN with data:', requestBody);
      
      // Call the test IPN webhook function
      const { data: response, error } = await supabase.functions.invoke('test-ipn-webhook', {
        body: requestBody
      });
      
      if (error) {
        console.error('Error sending test IPN:', error);
        toast.error('Failed to send test IPN', {
          description: error.message
        });
        setResult({ success: false, error: error.message });
        return;
      }
      
      console.log('Test IPN response:', response);
      
      if (response.success) {
        toast.success('Test IPN processed successfully', {
          description: response.message
        });
      } else {
        toast.error('Test IPN failed', {
          description: response.message || response.error
        });
      }
      
      setResult(response);
    } catch (err) {
      console.error('Exception in test IPN submit:', err);
      toast.error('Exception during IPN test');
      setResult({ success: false, error: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateUUID = () => {
    const uuid = crypto.randomUUID();
    form.setValue('txn_id', uuid);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Test CoinPayments IPN Webhook</CardTitle>
        <CardDescription>
          Simulate a CoinPayments IPN notification to test webhook processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transaction ID */}
              <FormField
                control={form.control}
                name="txn_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction ID (external_transaction_id)</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input placeholder="Transaction ID" {...field} />
                      </FormControl>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleGenerateUUID}
                      >
                        Generate UUID
                      </Button>
                    </div>
                    <FormDescription>
                      Must match an existing transaction's external_transaction_id
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
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
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      CoinPayments transaction status code
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center space-x-2">
                <div className="h-px flex-1 bg-border"></div>
                <div className="text-sm text-muted-foreground">Advanced Options</div>
                <div className="h-px flex-1 bg-border"></div>
              </div>
              
              {/* Raw JSON input */}
              <FormField
                control={form.control}
                name="raw_json"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raw JSON (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`{
  "ipn_type": "api",
  "ipn_mode": "hmac",
  "txn_id": "your-transaction-id",
  "status": "100",
  "status_text": "Complete"
}`}
                        className="min-h-[150px] font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide custom JSON payload (overrides form values)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit button */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Send Test IPN'}
            </Button>
          </form>
        </Form>
        
        {/* Result display */}
        {result && (
          <div className="mt-6">
            <Alert variant={result.success ? "success" : "destructive"}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              </div>
              <AlertDescription className="mt-2">{result.message || result.error}</AlertDescription>
              
              {/* Details Section */}
              <div className="mt-4 pt-4 border-t">
                <details>
                  <summary className="cursor-pointer text-sm font-medium">Response Details</summary>
                  <pre className="mt-2 p-4 bg-secondary text-secondary-foreground rounded-md text-xs overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestIPNForm;
