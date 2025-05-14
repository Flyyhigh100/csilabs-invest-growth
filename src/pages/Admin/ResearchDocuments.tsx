
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
    checking: true,
    retryCount: 0
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
      
      // If the bucket doesn't appear to exist but should, try to create it automatically
      if (!exists && bucketStatus.retryCount < 2) {
        console.log("Bucket doesn't exist, attempting to create it automatically...");
        const created = await createBucketIfNotExists(bucketName);
        
        if (created) {
          console.log("Successfully created the bucket!");
          setBucketStatus({
            exists: true,
            buckets: [...availableBuckets, bucketName],
            checking: false,
            retryCount: 0
          });
          return true;
        } else {
          console.log("Failed to create the bucket automatically.");
        }
      }
      
      setBucketStatus({
        exists,
        buckets: availableBuckets,
        checking: false,
        retryCount: bucketStatus.retryCount + 1
      });
      
      return exists;
    } catch (error) {
      console.error('Error checking storage bucket:', error);
      setBucketStatus(prev => ({
        exists: false,
        buckets: prev.buckets,
        checking: false,
        retryCount: prev.retryCount + 1
      }));
      return false;
    }
  }, [bucketStatus.retryCount]);
  
  // Check storage bucket on component mount
  useEffect(() => {
    checkStorageBucket();
  }, [checkStorageBucket]);

  // Helper function for manual refresh with reset counter
  const handleManualRefresh = () => {
    setBucketStatus(prev => ({ ...prev, retryCount: 0, checking: true }));
    setTimeout(() => {
      checkStorageBucket();
    }, 1000);
  };

  return (
    <AdminLayout title="Manage Research Documents">
      <div className="grid gap-6">
        {/* Storage Bucket Status */}
        {!bucketStatus.checking && (
          <BucketStatusCard
            bucketExists={bucketStatus.exists}
            bucketName="research_documents"
            availableBuckets={bucketStatus.buckets}
            onRefresh={handleManualRefresh}
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
