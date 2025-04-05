
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
    isAuthenticated,
    loadDocumentsFromFile,
    addDocument,
    checkResearchBucket,
    checkAuthentication
  } = useResearchDocuments();

  // Check authentication status on page load
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthed = await checkAuthentication();
      if (!isAuthed) {
        toast.error("You must be logged in to access this page");
      } else {
        console.log("User authenticated and ready to use document features");
      }
    };
    
    checkAuth();
  }, [checkAuthentication]);

  return (
    <AdminLayout title="Manage Research Documents">
      <div className="grid gap-6">
        {/* Authentication Status */}
        {!isAuthenticated && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
            <h3 className="font-medium mb-1">Authentication Required</h3>
            <p className="text-sm">You need to be logged in to upload documents and access storage buckets.</p>
          </div>
        )}
        
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
          isAuthenticated={isAuthenticated}
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
