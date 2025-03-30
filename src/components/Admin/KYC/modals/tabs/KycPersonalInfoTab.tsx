
import React from 'react';
import { KycVerificationWithProfile } from '../../types';

interface KycPersonalInfoTabProps {
  kyc: KycVerificationWithProfile;
}

const KycPersonalInfoTab: React.FC<KycPersonalInfoTabProps> = ({ kyc }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm font-medium text-gray-500">First Name</p>
        <p>{kyc.first_name || '-'}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">Last Name</p>
        <p>{kyc.last_name || '-'}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">Date of Birth</p>
        <p>{kyc.date_of_birth || '-'}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">Nationality</p>
        <p>{kyc.nationality || '-'}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">Address</p>
        <p>{kyc.address || '-'}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">City</p>
        <p>{kyc.city || '-'}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">Postal Code</p>
        <p>{kyc.postal_code || '-'}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">Country</p>
        <p>{kyc.country || '-'}</p>
      </div>
    </div>
  );
};

export default KycPersonalInfoTab;
