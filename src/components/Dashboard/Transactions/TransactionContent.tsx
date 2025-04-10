
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import TransactionsList from './TransactionsList';

interface TransactionContentProps {
  isKycApproved: boolean;
  allowTransactionsWithoutKYC: boolean;
}

const TransactionContent: React.FC<TransactionContentProps> = ({
  isKycApproved,
  allowTransactionsWithoutKYC
}) => {
  if (!isKycApproved && !allowTransactionsWithoutKYC) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">
          You need to complete KYC verification before you can make transactions.
        </p>
        <Button asChild>
          <Link to="/dashboard/kyc">Complete Verification</Link>
        </Button>
      </div>
    );
  }
  
  return <TransactionsList />;
};

export default TransactionContent;
