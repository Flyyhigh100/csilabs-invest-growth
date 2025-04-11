
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const TestIpnForm = () => {
  const [txnId, setTxnId] = useState('');
  const [status, setStatus] = useState('0'); // Default to 0 (pending)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!txnId) {
      toast.error('Transaction ID is required');
      return;
    }
    
    setIsSubmitting(true);
    setResponse(null);
    
    try {
      // Create a basic IPN payload
      const ipnPayload = {
        ipn_type: 'api',
        ipn_id: `test_${Date.now()}`,
        ipn_version: '1.0',
        txn_id: txnId,
        status: parseInt(status, 10),
        status_text: getStatusText(parseInt(status, 10))
      };
      
      toast.info('Sending test IPN webhook...');
      
      // Call the test IPN webhook endpoint
      const { data, error } = await supabase.functions.invoke('test-ipn-webhook', {
        body: ipnPayload
      });
      
      if (error) {
        console.error('Error sending test IPN:', error);
        toast.error('Failed to send test IPN');
        setResponse({ error: error.message });
      } else {
        console.log('Test IPN response:', data);
        setResponse(data);
        
        if (data.success) {
          if (data.details?.transaction_update?.success) {
            toast.success('Transaction status updated successfully!');
          } else if (data.details?.transaction_update?.noChange) {
            toast.info('Transaction status already up-to-date');
          } else {
            toast.info('IPN processed but no transaction update needed');
          }
        } else {
          toast.error('IPN processing failed');
        }
      }
    } catch (error) {
      console.error('Exception sending test IPN:', error);
      toast.error('An error occurred');
      setResponse({ error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatusText = (statusCode: number): string => {
    switch (statusCode) {
      case -1: return 'Cancelled / Error';
      case 0: return 'Pending';
      case 1: return 'Payment Received';
      case 2: return 'Completed';
      case 3: return 'Confirmed';
      case 100: return 'Complete / Confirmed';
      default: return `Status ${statusCode}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test IPN Webhook</CardTitle>
        <CardDescription>
          Send a test IPN webhook to simulate payment status updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="txn_id">CoinPayments Transaction ID</Label>
            <Input
              id="txn_id"
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              placeholder="Enter external_transaction_id"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Payment Status</Label>
            <Select
              value={status}
              onValueChange={setStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="-1">-1: Cancelled / Error</SelectItem>
                  <SelectItem value="0">0: Pending</SelectItem>
                  <SelectItem value="1">1: Payment Received</SelectItem>
                  <SelectItem value="2">2: Completed</SelectItem>
                  <SelectItem value="3">3: Confirmed</SelectItem>
                  <SelectItem value="100">100: Complete / Confirmed</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Test IPN'}
          </Button>
        </form>
        
        {response && (
          <div className="mt-6">
            <Label>Response</Label>
            <Textarea
              value={JSON.stringify(response, null, 2)}
              readOnly
              className="h-64 font-mono text-xs"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestIpnForm;
