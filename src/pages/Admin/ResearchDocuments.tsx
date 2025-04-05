
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import BucketStatusCard from '@/components/Admin/ResearchDocuments/BucketStatusCard';
import DocumentUploadForm from '@/components/Admin/ResearchDocuments/DocumentUploadForm';
import DocumentsList from '@/components/Admin/ResearchDocuments/DocumentsList';
import { useResearchDocuments } from '@/components/Admin/ResearchDocuments/hooks/useResearchDocuments';

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
