
import React, { useEffect } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import DocumentUploadForm from '@/components/Admin/ResearchDocuments/DocumentUploadForm';
import DocumentsList from '@/components/Admin/ResearchDocuments/DocumentsList';
import { useResearchDocuments } from '@/components/Admin/ResearchDocuments/hooks/useResearchDocuments';
import { toast } from 'sonner';

const AdminResearchDocuments = () => {
  const {
    documents,
    isLoading,
    bucketName,
    isAuthenticated,
    loadDocumentsFromFile,
    addDocument,
    checkAuthentication
  } = useResearchDocuments();

  // Check authentication status on page load
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthed = await checkAuthentication();
      if (!isAuthed) {
        toast.error("You must be logged in to access this page");
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
        
        {/* Document Upload Form */}
        <DocumentUploadForm 
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
