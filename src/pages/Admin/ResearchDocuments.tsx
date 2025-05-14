
import React, { useEffect, useCallback, useState } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import DocumentUploadForm from '@/components/Admin/ResearchDocuments/DocumentUploadForm';
import DocumentsList from '@/components/Admin/ResearchDocuments/DocumentsList';
import { useResearchDocuments } from '@/components/Admin/ResearchDocuments/hooks/useResearchDocuments';
import { toast } from 'sonner';
import BucketStatusCard from '@/components/Admin/ResearchDocuments/BucketStatusCard';
import { listAllBuckets, checkBucketExists, createBucketIfNotExists } from '@/utils/admin/kyc/storage';

const AdminResearchDocuments = () => {
  const {
    documents,
    isLoading,
    isAuthenticated,
    loadDocumentsFromStorage,
    uploadDocument,
    deleteDocument,
    checkAuthentication,
    updateDocumentMetadata
  } = useResearchDocuments();

  const [bucketStatus, setBucketStatus] = useState({
    exists: false,
    buckets: [] as string[],
    checking: true
  });

  // Check authentication status on page load - no need to show warnings since AdminRoute handles this
  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);
  
  // Check if storage bucket exists
  const checkStorageBucket = useCallback(async () => {
    try {
      setBucketStatus(prev => ({ ...prev, checking: true }));
      const bucketName = 'research_documents';
      
      // First get all available buckets
      const availableBuckets = await listAllBuckets();
      
      // Then check if our bucket exists
      const exists = await checkBucketExists(bucketName);
      
      console.log(`Bucket '${bucketName}' exists:`, exists);
      console.log('Available buckets:', availableBuckets);
      
      setBucketStatus({
        exists,
        buckets: availableBuckets,
        checking: false
      });
      
      return exists;
    } catch (error) {
      console.error('Error checking storage bucket:', error);
      setBucketStatus({
        exists: false,
        buckets: [],
        checking: false
      });
      return false;
    }
  }, []);
  
  // Check storage bucket on component mount
  useEffect(() => {
    checkStorageBucket();
  }, [checkStorageBucket]);

  return (
    <AdminLayout title="Manage Research Documents">
      <div className="grid gap-6">
        {/* Storage Bucket Status */}
        {!bucketStatus.checking && (
          <BucketStatusCard
            bucketExists={bucketStatus.exists}
            bucketName="research_documents"
            availableBuckets={bucketStatus.buckets}
            onRefresh={checkStorageBucket}
          />
        )}
        
        {/* Document Upload Form - passing bucketExists instead of isAuthenticated */}
        <DocumentUploadForm 
          onDocumentUploaded={uploadDocument} 
          bucketExists={bucketStatus.exists}
        />
        
        {/* Documents List */}
        <DocumentsList 
          documents={documents} 
          isLoading={isLoading} 
          onReload={loadDocumentsFromStorage}
          onUpdateDocument={updateDocumentMetadata}
          onDeleteDocument={deleteDocument}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminResearchDocuments;
