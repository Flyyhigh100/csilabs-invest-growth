
import React, { useState } from 'react';
import { KycVerificationWithProfile } from '../../types';
import { toast } from 'sonner';
import DocumentSection from './components/DocumentSection';
import DebugInfo from './components/DebugInfo';

interface KycDocumentsTabProps {
  kyc: KycVerificationWithProfile;
}

const KycDocumentsTab: React.FC<KycDocumentsTabProps> = ({ kyc }) => {
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);
  
  const openFullImage = (url: string) => {
    setFullImageUrl(url);
    window.open(url, '_blank');
    toast.info('Opening full-size image in new tab');
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DocumentSection 
          title="ID Front" 
          imageUrl={kyc.id_front_url} 
          onOpenFullImage={openFullImage} 
        />
        
        <DocumentSection 
          title="ID Back" 
          imageUrl={kyc.id_back_url} 
          onOpenFullImage={openFullImage} 
        />
        
        <DocumentSection 
          title="Selfie with ID" 
          imageUrl={kyc.selfie_url} 
          onOpenFullImage={openFullImage} 
        />
      </div>
      
      <DebugInfo kyc={kyc} />
    </div>
  );
};

export default KycDocumentsTab;
