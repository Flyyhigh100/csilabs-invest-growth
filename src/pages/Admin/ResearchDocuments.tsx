
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
    bucketName,
    isAuthenticated,
    loadDocumentsFromStorage,
    addDocument,
    deleteDocument,
    checkAuthentication,
    updateDocumentMetadata
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

  // Handle Harvard document special update via URL parameter
  const handleSpecialDocumentUpdate = useCallback((docId: string) => {
    // Find the document with this ID
    const doc = documents.find(d => d.id === `doc-${docId}`);
    
    if (doc) {
      // Update this specific document with Harvard data
      const harvardUpdate = {
        title: "Harvard Global Health Catalyst Summit Invitation and Industry Leader Award",
        description: "Official invitation letter from Harvard Medical School's Global Health Catalyst to Raymond C. Dabney, President & CEO of Cannabis Science Inc., to serve as keynote speaker at the 2018 Harvard Global Health Catalyst Summit. The letter announces Mr. Dabney's selection for the prestigious 2018 Harvard GHC Industry Leader Award in recognition of his groundbreaking collaborations with African institutions to develop cannabinoid-based cancer treatments. The summit focused on building high-impact USA-Africa collaborations to address cancer and other non-communicable diseases.",
        category: "Awards, Academic Recognition, Institutional Partnerships",
        publishDate: "May 2, 2018",
        authors: "Prof. Wilfred Ngwa, MS, PhD, Chair of Organizing Committee, Director of Global Health Catalyst, Dana Farber/Harvard Cancer Center"
      };
      
      return updateDocumentMetadata(`doc-${docId}`, harvardUpdate);
    }
    return Promise.resolve(false);
  }, [documents, updateDocumentMetadata]);

  // When the page loads, also check for specific document updates from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const docId = searchParams.get('updateDoc');
    
    if (docId && documents.length > 0) {
      handleSpecialDocumentUpdate(docId).then(success => {
        if (success) {
          // Remove the query parameter
          const url = new URL(window.location.href);
          url.searchParams.delete('updateDoc');
          window.history.replaceState({}, '', url);
        }
      });
    }
  }, [documents, handleSpecialDocumentUpdate]);

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
          onReload={loadDocumentsFromStorage}
          onUpdateDocument={updateDocumentMetadata}
          onDeleteDocument={deleteDocument}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminResearchDocuments;
