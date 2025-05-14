
import React, { useEffect, useCallback } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import DocumentUploadForm from '@/components/Admin/ResearchDocuments/DocumentUploadForm';
import DocumentsList from '@/components/Admin/ResearchDocuments/DocumentsList';
import { useResearchDocuments } from '@/components/Admin/ResearchDocuments/hooks/useResearchDocuments';
import { toast } from 'sonner';

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
        
        {/* Document Upload Form */}
        <DocumentUploadForm 
          onDocumentUploaded={uploadDocument} 
          isAuthenticated={isAuthenticated}
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
