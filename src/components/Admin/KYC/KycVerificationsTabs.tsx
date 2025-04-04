
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { KycVerificationWithProfile } from './types';
import KycVerificationsList from './KycVerificationsList';

interface KycVerificationsTabsProps {
  kycVerifications: KycVerificationWithProfile[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onViewDetails: (verification: KycVerificationWithProfile) => void;
}

const KycVerificationsTabs: React.FC<KycVerificationsTabsProps> = ({
  kycVerifications,
  activeTab,
  setActiveTab,
  onViewDetails
}) => {
  // Filter verifications based on active tab
  const filteredVerifications = kycVerifications.filter(verification => {
    if (activeTab === 'pending') return verification.status === 'pending';
    if (activeTab === 'approved') return verification.status === 'approved';
    if (activeTab === 'rejected') return verification.status === 'rejected';
    if (activeTab === 'not_submitted') return verification.status === 'not_started';
    if (activeTab === 'all') return true;
    return false;
  });

  // Count verifications by status for badges
  const pendingCount = kycVerifications.filter(v => v.status === 'pending').length;
  const notSubmittedCount = kycVerifications.filter(v => v.status === 'not_started').length;

  return (
    <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4 flex flex-wrap">
        <TabsTrigger value="pending">
          Pending
          {pendingCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {pendingCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="approved">Approved</TabsTrigger>
        <TabsTrigger value="rejected">Rejected</TabsTrigger>
        <TabsTrigger value="not_submitted">
          Not Submitted
          {notSubmittedCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {notSubmittedCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="all">All Users</TabsTrigger>
      </TabsList>
      
      <TabsContent value={activeTab}>
        <KycVerificationsList 
          verifications={filteredVerifications} 
          onViewDetails={onViewDetails} 
        />
      </TabsContent>
    </Tabs>
  );
};

export default KycVerificationsTabs;
