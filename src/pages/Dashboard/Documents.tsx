
import React from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import KycStatusBanner from '@/components/Dashboard/KycStatusBanner';
import { useKycVerification } from '@/hooks/useKycVerification';
import KycDocumentsTable from '@/components/KYC/KycDocumentsTable';
import NoDocumentsSubmitted from '@/components/KYC/NoDocumentsSubmitted';

const Documents = () => {
  const { kycData, isLoading } = useKycVerification();
  
  const hasSubmittedDocuments = kycData && 
    (kycData.id_front_url || kycData.id_back_url || kycData.selfie_url);
  
  const isKycApproved = kycData?.status === 'approved';
  
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
          <CardTitle className="text-lg">Your Documents</CardTitle>
          <CardDescription>
            {isKycApproved 
              ? "Your verification documents and submitted information" 
              : "Your submitted verification documents"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cbis-blue"></div>
            </div>
          ) : !hasSubmittedDocuments ? (
            <NoDocumentsSubmitted />
          ) : (
            <KycDocumentsTable 
              documentUrls={{
                id_front_url: kycData?.id_front_url || null,
                id_back_url: kycData?.id_back_url || null,
                selfie_url: kycData?.selfie_url || null
              }}
              createdAt={kycData?.created_at || ''}
              updatedAt={kycData?.updated_at || ''}
            />
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Documents;
