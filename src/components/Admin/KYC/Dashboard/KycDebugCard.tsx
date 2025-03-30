
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KycVerificationWithProfile } from '../types';
import { RefreshCw } from 'lucide-react';

interface KycDebugCardProps {
  lastFetchTime: string | null;
  realtimeEnabled: boolean;
  kycVerifications: KycVerificationWithProfile[];
  directTestResults: string | null;
  onRefresh: () => void;
}

const KycDebugCard: React.FC<KycDebugCardProps> = ({
  lastFetchTime,
  realtimeEnabled,
  kycVerifications,
  directTestResults,
  onRefresh
}) => {
  // Calculate counts by status
  const statusCounts = kycVerifications.reduce((counts, item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  return (
    <Card className="bg-slate-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between">
          <span>Debugging Information</span>
          <Button variant="ghost" size="sm" onClick={onRefresh} className="h-6 gap-1">
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm text-slate-500">
          <p><strong>Connection:</strong> {realtimeEnabled ? '✅ Realtime enabled' : '❌ Realtime not connected'}</p>
          <p><strong>Last fetch:</strong> {lastFetchTime ? new Date(lastFetchTime).toLocaleTimeString() : 'Never'}</p>
          <p><strong>KYC records:</strong> {kycVerifications.length} total</p>
          
          <div className="mt-2">
            <p><strong>Status counts:</strong></p>
            <ul className="list-disc pl-5 text-xs">
              {Object.entries(statusCounts).map(([status, count]) => (
                <li key={status}>{status}: {count}</li>
              ))}
            </ul>
          </div>
          
          <div className="mt-2">
            <p><strong>User IDs with KYC records:</strong></p>
            <div className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-20">
              {kycVerifications.map(kyc => (
                <div key={kyc.id} className="mb-1">
                  {kyc.user_id}: {kyc.status} ({kyc.first_name} {kyc.last_name})
                </div>
              ))}
            </div>
          </div>
          
          {directTestResults && (
            <div className="mt-2">
              <p><strong>Direct database test results:</strong></p>
              <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-32">
                {directTestResults}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KycDebugCard;
