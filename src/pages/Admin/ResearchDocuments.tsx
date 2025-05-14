
import React, { useEffect, useCallback, useState } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import DocumentUploadForm from '@/components/Admin/ResearchDocuments/DocumentUploadForm';
import DocumentsList from '@/components/Admin/ResearchDocuments/DocumentsList';
import { useResearchDocuments } from '@/components/Admin/ResearchDocuments/hooks/useResearchDocuments';
import { toast } from 'sonner';
import BucketStatusCard from '@/components/Admin/ResearchDocuments/BucketStatusCard';
import { listAllBuckets, checkBucketExists } from '@/utils/admin/kyc/storage';

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

  // Check authentication status on page load
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthed = await checkAuthentication();
      if (!isAuthed) {
        toast.error("Admin privileges required to manage documents");
      }
    };
    
    checkAuth();
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
    if (isAuthenticated) {
      checkStorageBucket();
    }
  }, [isAuthenticated, checkStorageBucket]);

  return (
    <AdminLayout title="Manage Research Documents">
      <div className="grid gap-6">
        {/* Authentication Status */}
        {!isAuthenticated && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
            <h3 className="font-medium mb-1">Authentication Required</h3>
            <p className="text-sm">Admin privileges required to upload and manage documents.</p>
          </div>
        )}
        
        {/* Storage Bucket Status */}
        {isAuthenticated && !bucketStatus.checking && (
          <BucketStatusCard
            bucketExists={bucketStatus.exists}
            bucketName="research_documents"
            availableBuckets={bucketStatus.buckets}
            onRefresh={checkStorageBucket}
          />
        )}
        
        {/* Document Upload Form */}
        <DocumentUploadForm 
          onDocumentUploaded={uploadDocument} 
          isAuthenticated={isAuthenticated && bucketStatus.exists}
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
