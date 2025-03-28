
import React from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import KycStatusBanner from '@/components/Dashboard/KycStatusBanner';
import { useKycVerification } from '@/hooks/useKycVerification';

const Documents = () => {
  const { kycData } = useKycVerification();
  const isKycApproved = kycData?.status === 'approved';
  
  // Mock empty documents list for now
  const documents: any[] = [];

  return (
    <DashboardLayout title="Documents">
      {/* KYC Status Banner */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Verification Status</CardTitle>
          <CardDescription>Your identity verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <KycStatusBanner />
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Documents</CardTitle>
          <CardDescription>Your documents and contracts</CardDescription>
        </CardHeader>
        <CardContent>
          {!isKycApproved ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                You need to complete KYC verification to access your documents.
              </p>
            </div>
          ) : documents.length > 0 ? (
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Document rows would go here */}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-900">No documents yet</h3>
              <p className="text-sm text-gray-500 mt-1">Your documents will appear here once generated.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Documents;
