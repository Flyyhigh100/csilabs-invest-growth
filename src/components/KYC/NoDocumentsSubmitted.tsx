
import React from 'react';
import { FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const NoDocumentsSubmitted: React.FC = () => {
  return (
    <div className="text-center py-8">
      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-sm font-medium text-gray-900">No verification documents submitted</h3>
      <p className="text-sm text-gray-500 mt-1 mb-4">
        You need to complete the KYC verification process to view your documents.
      </p>
      <Button asChild>
        <Link to="/dashboard/kyc">
          <Upload className="mr-2 h-4 w-4" />
          Start Verification
        </Link>
      </Button>
    </div>
  );
};

export default NoDocumentsSubmitted;
