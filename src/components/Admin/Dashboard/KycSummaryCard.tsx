
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { testDirectKycAccess } from '@/components/Admin/KYC/KycVerificationsService';
import { toast } from 'sonner';

interface KycSummaryCardProps {
  kycCounts: {
    pending: number;
    approved: number;
    rejected: number;
    not_started: number;
    needs_clarification: number;
  };
  isLoading: boolean;
  refetch: () => void;
}

const KycSummaryCard: React.FC<KycSummaryCardProps> = ({ kycCounts, isLoading, refetch }) => {
  const navigate = useNavigate();
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const handleTestDatabase = async () => {
    try {
      toast.loading('Testing database access...');
      const result = await testDirectKycAccess();
      setDebugInfo(JSON.stringify(result, null, 2));
      toast.success(`Found ${result.count} KYC records (${result.pendingCount} pending)`);
    } catch (error) {
      console.error('Database test error:', error);
      toast.error('Database test failed');
      setDebugInfo(JSON.stringify({ error: (error as Error).message }, null, 2));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>KYC Management</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-amber-500 mr-2" />
              <span>Pending Reviews</span>
            </div>
            <span className="font-bold">{isLoading ? '...' : kycCounts.pending}</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>Approved</span>
            </div>
            <span className="font-bold">{isLoading ? '...' : kycCounts.approved}</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <span>Rejected</span>
            </div>
            <span className="font-bold">{isLoading ? '...' : kycCounts.rejected}</span>
          </div>
          
          <Button 
            className="w-full mt-4 bg-gradient-to-r from-cbis-blue to-cbis-teal"
            onClick={() => navigate('/admin/kyc')}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Manage KYC Verifications
          </Button>
          
          {/* Debug button for testing database access */}
          <Button 
            variant="outline" 
            className="w-full mt-2"
            onClick={handleTestDatabase}
          >
            Test Database Connection
          </Button>
          
          {/* Debug info display */}
          {debugInfo && (
            <div className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
              <pre>{debugInfo}</pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KycSummaryCard;
