
import React from 'react';
import { KycVerificationWithProfile } from '../../types';

interface KycHistoryTabProps {
  kyc: KycVerificationWithProfile;
}

const KycHistoryTab: React.FC<KycHistoryTabProps> = ({ kyc }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="font-medium text-gray-500">Status:</span>
          <span className="ml-2 capitalize">{kyc.status}</span>
        </div>
        <div>
          <span className="font-medium text-gray-500">Submitted:</span>
          <span className="ml-2">
            {kyc.submitted_at 
              ? new Date(kyc.submitted_at).toLocaleString() 
              : 'Not submitted'}
          </span>
        </div>
        {kyc.reviewed_at && (
          <div className="col-span-2">
            <span className="font-medium text-gray-500">Reviewed:</span>
            <span className="ml-2">
              {new Date(kyc.reviewed_at).toLocaleString()}
            </span>
          </div>
        )}
        {kyc.rejection_reason && (
          <div className="col-span-2">
            <span className="font-medium text-gray-500">Rejection Reason:</span>
            <span className="ml-2">{kyc.rejection_reason}</span>
          </div>
        )}
        {kyc.clarification_message && (
          <div className="col-span-2">
            <span className="font-medium text-gray-500">Clarification Request:</span>
            <span className="ml-2">{kyc.clarification_message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KycHistoryTab;
