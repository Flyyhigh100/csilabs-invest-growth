
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { KycVerificationWithProfile } from '../types';

interface KycDebugCardProps {
  lastFetchTime: string | null;
  realtimeEnabled: boolean;
  kycVerifications: KycVerificationWithProfile[];
  directTestResults: string | null;
}

const KycDebugCard: React.FC<KycDebugCardProps> = ({
  lastFetchTime,
  realtimeEnabled,
  kycVerifications,
  directTestResults
}) => {
  return (
    <Card className="bg-slate-50">
      <CardContent className="pt-4">
        <div className="text-sm text-slate-500">
          <p><strong>Status:</strong> {realtimeEnabled ? '✅ Realtime enabled' : '❌ Realtime not connected'}</p>
          <p><strong>Last fetch:</strong> {lastFetchTime ? new Date(lastFetchTime).toLocaleTimeString() : 'Never'}</p>
          <p><strong>KYC records:</strong> {kycVerifications.length} total, {kycVerifications.filter(v => v.status === 'pending').length} pending</p>
          
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
