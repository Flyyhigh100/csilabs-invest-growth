
import React, { useEffect } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import BucketStatusCard from '@/components/Admin/ResearchDocuments/BucketStatusCard';
import DocumentUploadForm from '@/components/Admin/ResearchDocuments/DocumentUploadForm';
import DocumentsList from '@/components/Admin/ResearchDocuments/DocumentsList';
import { useResearchDocuments } from '@/components/Admin/ResearchDocuments/hooks/useResearchDocuments';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminResearchDocuments = () => {
  const {
    documents,
    isLoading,
    bucketExists,
    bucketName,
    availableBuckets,
    loadDocumentsFromFile,
    addDocument,
    checkResearchBucket
  } = useResearchDocuments();

  // Check authentication status on page load
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("You must be logged in to access this page");
      } else {
        console.log("User authenticated:", data.session.user.email);
      }
    };
    
    checkAuth();
  }, []);

  return (
    <AdminLayout title="Manage Research Documents">
      <div className="grid gap-6">
        {/* Storage Bucket Status Card */}
        <BucketStatusCard 
          bucketExists={bucketExists} 
          bucketName={bucketName} 
          availableBuckets={availableBuckets}
          onRefresh={checkResearchBucket}
        />
        
        {/* Document Upload Form */}
        <DocumentUploadForm 
          bucketExists={bucketExists} 
          bucketName={bucketName} 
          onDocumentUploaded={addDocument} 
        />
        
        {/* Documents List */}
        <DocumentsList 
          documents={documents} 
          isLoading={isLoading} 
          onReload={loadDocumentsFromFile} 
        />
      </div>
    </AdminLayout>
  );
};

export default AdminResearchDocuments;
