
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, BadgeAlert, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
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
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface TestDataResult {
  marked_as_test: {
    transactions: number;
    kyc_verifications: number;
    notifications: number;
  };
  success: boolean;
  timestamp: string;
}

const TestDataCard: React.FC = () => {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<TestDataResult | null>(null);

  const handleMarkAsTest = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('mark-data-as-test');
      
      if (error) {
        console.error('Error marking data as test:', error);
        toast.error('Failed to mark data as test');
        return;
      }
      
      console.log('Mark as test response:', data);
      setLastResult(data.details);
      
      // Show success message with counts
      toast.success(`Successfully marked ${data.details.marked_as_test.transactions} transactions, ${data.details.marked_as_test.kyc_verifications} KYC verifications, and ${data.details.marked_as_test.notifications} notifications as test data.`);
      
    } catch (err) {
      console.error('Exception marking data as test:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
      setIsConfirmDialogOpen(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="bg-amber-50 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                Test Data Management
              </CardTitle>
              <CardDescription>
                Use these tools to prepare for production
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300">
              Admin Only
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="rounded-lg border border-amber-200 p-4 bg-amber-50 dark:bg-amber-950/10">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <BadgeAlert className="h-4 w-4 mr-2 text-amber-600" />
                Mark All Data as Test
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This action will mark all existing transactions, KYC verifications, and notifications 
                as test data. This is useful before going into production to distinguish between test data 
                and real production data.
              </p>
              <div className="flex justify-between items-center">
                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={() => setIsConfirmDialogOpen(true)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Mark All as Test Data
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {lastResult && (
              <div className="rounded-lg border border-green-200 p-4 bg-green-50 dark:bg-green-950/10">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Last Operation Results
                </h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <div className="font-medium">Transactions</div>
                    <div className="text-lg">{lastResult.marked_as_test.transactions}</div>
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <div className="font-medium">KYC Verifications</div>
                    <div className="text-lg">{lastResult.marked_as_test.kyc_verifications}</div>
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <div className="font-medium">Notifications</div>
                    <div className="text-lg">{lastResult.marked_as_test.notifications}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Operation completed at {new Date(lastResult.timestamp).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-amber-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Mark All Data as Test
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This action will mark <strong>all existing data</strong> in the system as test data. 
                This is useful before going into production to separate test data from real production data.
              </p>
              <p className="font-medium">
                Are you sure you want to proceed?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleMarkAsTest();
              }}
              disabled={isProcessing}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isProcessing ? 'Processing...' : 'Mark All as Test Data'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TestDataCard;
