
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KycPersonalInfoTab from './tabs/KycPersonalInfoTab';
import KycDocumentsTab from './tabs/KycDocumentsTab';
import KycHistoryTab from './tabs/KycHistoryTab';
import { KycVerificationWithProfile } from '../types';

interface KycModalTabsProps {
  selectedKyc: KycVerificationWithProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const KycModalTabs: React.FC<KycModalTabsProps> = ({ 
  selectedKyc, 
  activeTab, 
  setActiveTab 
}) => {
  return (
    <Tabs 
      defaultValue="info" 
      value={activeTab} 
      onValueChange={setActiveTab} 
      className="mt-2"
    >
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="info">Personal Information</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      
      <TabsContent value="info">
        <KycPersonalInfoTab kyc={selectedKyc} />
      </TabsContent>
      
      <TabsContent value="documents">
        <KycDocumentsTab kyc={selectedKyc} />
      </TabsContent>
      
      <TabsContent value="history">
        <KycHistoryTab kyc={selectedKyc} />
      </TabsContent>
    </Tabs>
  );
};

export default KycModalTabs;
