
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useKycVerification, KycFormData } from '@/hooks/useKycVerification';
import PersonalInfoForm, { PersonalInfoValues } from '@/components/KYC/PersonalInfoForm';
import DocumentVerification from '@/components/KYC/DocumentVerification';
import VerificationStatus from '@/components/KYC/VerificationStatus';

const KYCVerification = () => {
  const { user } = useAuth();
  const {
    kycData,
    isLoading,
    error,
    savePersonalInfo,
    uploadDocument,
    submitVerification,
    refetch
  } = useKycVerification();
  
  const [activeTab, setActiveTab] = useState<string>("personal-info");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Monitor kycData changes to update tab selection
  useEffect(() => {
    if (kycData) {
      console.log("KYC data updated, current status:", kycData.status);
      
      if (kycData.status === 'pending' || kycData.status === 'approved' || kycData.status === 'rejected') {
        console.log("Setting active tab to verification-status based on KYC status");
        setActiveTab("verification-status");
      }
    }
  }, [kycData]);

  const handlePersonalInfoSubmit = async (values: PersonalInfoValues) => {
    try {
      // Ensure all required fields are present and convert to KycFormData type
      const formData: KycFormData = {
        first_name: values.first_name,
        last_name: values.last_name,
        date_of_birth: values.date_of_birth,
        nationality: values.nationality,
        address: values.address,
        city: values.city,
        postal_code: values.postal_code,
        country: values.country
      };
      
      await savePersonalInfo.mutateAsync(formData);
      setActiveTab("document-verification");
    } catch (error) {
      console.error("Error saving personal info:", error);
      toast.error("Failed to save personal information");
    }
  };

  const handleDocumentUpload = async (
    file: File, 
    type: 'id_front' | 'id_back' | 'selfie'
  ) => {
    try {
      await uploadDocument.mutateAsync({ file, type });
      toast.success(`${type.replace('_', ' ')} uploaded successfully`);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type.replace('_', ' ')}`);
    }
  };

  const handleFinalSubmit = async () => {
    if (!kycData?.id_front_url || !kycData?.id_back_url || !kycData?.selfie_url) {
      toast.error("Please upload all required documents.");
      return;
    }

    console.log("Starting KYC submission process...");
    setIsSubmitting(true);

    try {
      console.log("Calling submitVerification.mutateAsync()");
      await submitVerification.mutateAsync();
      
      // Show explicit success message to the user
      toast.success("Your verification has been submitted successfully! We will review it shortly.");
      
      // Force a refetch to get the updated data
      await refetch();
      
      console.log("Verification submitted successfully, updating tab...");
      // Force the tab change to verification-status
      setActiveTab("verification-status");
      
    } catch (error) {
      console.error("Error submitting verification:", error);
      toast.error("An error occurred while submitting your verification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="KYC Verification">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
          <span className="ml-2 text-gray-600">Loading verification status...</span>
        </div>
      </DashboardLayout>
    );
  }

  const defaultPersonalInfoValues = {
    first_name: kycData?.first_name || "",
    last_name: kycData?.last_name || "",
    date_of_birth: kycData?.date_of_birth || "",
    nationality: kycData?.nationality || "",
    address: kycData?.address || "",
    city: kycData?.city || "",
    postal_code: kycData?.postal_code || "",
    country: kycData?.country || "",
  };

  const hasIdFront = !!kycData?.id_front_url;
  const hasIdBack = !!kycData?.id_back_url;
  const hasSelfie = !!kycData?.selfie_url;

  // Check if the verification status is already set and adjust tab accordingly
  const initialStatus = kycData?.status || 'not_started';
  useEffect(() => {
    console.log("Initial status:", initialStatus);
    if (initialStatus === 'pending' || initialStatus === 'approved' || initialStatus === 'rejected') {
      console.log("Setting initial tab to verification-status");
      setActiveTab("verification-status");
    }
  }, [initialStatus]);

  return (
    <DashboardLayout title="KYC Verification">
      <Card>
        <CardHeader>
          <CardTitle>Identity Verification</CardTitle>
          <CardDescription>
            Complete the verification process to unlock full platform access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger 
                value="personal-info" 
                disabled={kycData?.status === 'pending'}
              >
                Personal Information
              </TabsTrigger>
              <TabsTrigger 
                value="document-verification" 
                disabled={kycData?.status === 'pending' || activeTab === "personal-info"}
              >
                Document Verification
              </TabsTrigger>
              <TabsTrigger 
                value="verification-status"
              >
                Verification Status
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal-info" className="py-4">
              <PersonalInfoForm 
                defaultValues={defaultPersonalInfoValues} 
                onSubmit={handlePersonalInfoSubmit}
                isPending={savePersonalInfo.isPending}
              />
            </TabsContent>
            
            <TabsContent value="document-verification" className="py-4">
              <DocumentVerification
                hasIdFront={hasIdFront}
                hasIdBack={hasIdBack}
                hasSelfie={hasSelfie}
                isPending={uploadDocument.isPending}
                isSubmitting={isSubmitting}
                onBack={() => setActiveTab("personal-info")}
                onSubmit={handleFinalSubmit}
                onUpload={handleDocumentUpload}
              />
            </TabsContent>
            
            <TabsContent value="verification-status" className="py-4">
              <VerificationStatus 
                status={kycData?.status || 'not_started'}
                rejectionReason={kycData?.rejection_reason}
                onStartVerification={() => setActiveTab("personal-info")}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default KYCVerification;
