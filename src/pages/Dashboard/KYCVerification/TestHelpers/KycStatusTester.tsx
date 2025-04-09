
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createTestKycRecord } from '@/hooks/kyc/services/testHelpers';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface KycStatusTesterProps {
  onRefresh: () => Promise<void>;
  currentStatus: string | undefined | null;
}

const KycStatusTester: React.FC<KycStatusTesterProps> = ({ 
  onRefresh, 
  currentStatus 
}) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error' | 'running'>('idle');
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const createTestSubmission = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to test KYC functionality");
      setTestStatus('error');
      setTestResult("❌ Error: Not authenticated. Please log in first.");
      return;
    }

    setTestStatus('running');
    setTestResult(null);
    setDebugInfo(null);
    toast.info("Creating test KYC record with 'pending' status...");
    
    try {
      // Store the user ID we're testing with for debug purposes
      setDebugInfo(`Testing with user ID: ${user.id}`);
      console.log("🧪 Starting KYC test with user ID:", user.id);
      
      // Create test record
      const success = await createTestKycRecord(user.id);
      
      if (!success) {
        throw new Error("Failed to create test KYC record");
      }
      
      console.log("✅ Test record created successfully");
      
      // Refresh the KYC data
      await onRefresh();
      console.log("🔄 KYC data refreshed after test");
      
      // Give the database a moment to process the update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if the status was updated correctly
      console.log("🔍 Verifying KYC status...");
      const { data: verifyData, error } = await supabase
        .from('kyc_verifications')
        .select('status, id')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        console.error("Error verifying KYC status:", error);
        throw new Error(`Error verifying status: ${error.message}`);
      }
      
      console.log("📊 Current KYC status:", verifyData?.status, "Record ID:", verifyData?.id);
        
      if (verifyData?.status === 'pending') {
        setTestResult("✅ Success! KYC status was correctly set to 'pending'");
        setTestStatus('success');
        console.log("🎉 Test succeeded - status is 'pending'");
        toast.success("Test succeeded! KYC status is correctly updated to 'pending'");
      } else {
        setTestResult(`⚠️ Issue detected: Expected status 'pending' but found '${verifyData?.status || 'none'}'`);
        setTestStatus('error');
        console.log("⚠️ Test failed - unexpected status:", verifyData?.status);
        toast.error("Test failed! KYC status was not updated correctly");
      }
      
      // One more refresh to ensure UI is up to date
      await onRefresh();
    } catch (error) {
      console.error("❌ Error in test:", error);
      setTestResult(`❌ Error: ${(error as Error).message}`);
      setTestStatus('error');
      setDebugInfo(`Error details: ${JSON.stringify(error)}`);
      toast.error("Test failed with error");
    }
  };

  return (
    <div className="mt-6 border rounded-lg p-4 bg-slate-50">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <h3 className="font-medium">KYC Status Test Tool</h3>
        <Button variant="ghost" size="sm">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          <div className="bg-white p-4 rounded border">
            <h4 className="text-sm font-medium mb-2">Test Instructions:</h4>
            <ol className="text-sm space-y-2 list-decimal pl-5">
              <li>Click the "Run Test" button below</li>
              <li>The test will create a KYC record with "pending" status</li>
              <li>It will then check if the status updates properly</li>
              <li>You'll see the result below and in a toast notification</li>
            </ol>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full mr-2" 
                style={{ 
                  backgroundColor: 
                    currentStatus === 'not_started' ? 'red' : 
                    currentStatus === 'pending' ? 'orange' :
                    currentStatus === 'approved' ? 'green' :
                    currentStatus === 'rejected' ? 'red' : 'gray'
                }}></div>
              <span className="text-sm">Current KYC Status: <strong>{currentStatus || 'none'}</strong></span>
            </div>
            
            {user?.id ? (
              <Button 
                onClick={createTestSubmission} 
                className="flex items-center"
                disabled={testStatus === 'running'}
                variant={testStatus === 'success' ? 'outline' : 'default'}
              >
                {testStatus === 'running' ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : testStatus === 'success' ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                ) : testStatus === 'error' ? (
                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mr-2" />
                )}
                {testStatus === 'running' ? 'Running Test...' : 'Run Test'}
              </Button>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                <p className="text-sm text-amber-800">You must be logged in to run this test.</p>
              </div>
            )}
            
            {testResult && (
              <div className={`mt-4 p-3 rounded text-sm ${
                testStatus === 'success' ? 'bg-green-50 border border-green-200' : 
                'bg-red-50 border border-red-200'
              }`}>
                {testResult}
              </div>
            )}
            
            {debugInfo && testStatus === 'error' && (
              <div className="mt-2 p-2 bg-gray-100 rounded border text-xs font-mono overflow-x-auto">
                {debugInfo}
              </div>
            )}
            
            <Button 
              onClick={onRefresh} 
              variant="outline" 
              className="mt-3"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh KYC Data
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycStatusTester;
