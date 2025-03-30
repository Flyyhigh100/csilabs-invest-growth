
import React from 'react';
import { KycVerificationWithProfile } from '../../types';

interface KycDocumentsTabProps {
  kyc: KycVerificationWithProfile;
}

const KycDocumentsTab: React.FC<KycDocumentsTabProps> = ({ kyc }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kyc.id_front_url && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">ID Front</p>
          <a href={kyc.id_front_url} target="_blank" rel="noopener noreferrer">
            <img 
              src={kyc.id_front_url} 
              alt="ID Front" 
              className="w-full h-48 object-cover rounded-md border border-gray-200" 
            />
          </a>
        </div>
      )}
      
      {kyc.id_back_url && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">ID Back</p>
          <a href={kyc.id_back_url} target="_blank" rel="noopener noreferrer">
            <img 
              src={kyc.id_back_url} 
              alt="ID Back" 
              className="w-full h-48 object-cover rounded-md border border-gray-200" 
            />
          </a>
        </div>
      )}
      
      {kyc.selfie_url && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Selfie with ID</p>
          <a href={kyc.selfie_url} target="_blank" rel="noopener noreferrer">
            <img 
              src={kyc.selfie_url} 
              alt="Selfie with ID" 
              className="w-full h-48 object-cover rounded-md border border-gray-200" 
            />
          </a>
        </div>
      )}
    </div>
  );
};

export default KycDocumentsTab;
