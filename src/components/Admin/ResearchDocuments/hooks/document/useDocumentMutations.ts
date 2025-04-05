
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ResearchDocument } from '../../types/documentTypes';

export const useDocumentMutations = (
  documents: ResearchDocument[],
  setDocuments: React.Dispatch<React.SetStateAction<ResearchDocument[]>>,
  bucketName: string
) => {
  // Add a new document
  const addDocument = useCallback((newDocument: ResearchDocument) => {
    setDocuments(prevDocs => [...prevDocs, newDocument]);
    toast.success(`Document "${newDocument.title}" added successfully`);
    
    // Clear localStorage cache to force reload on the public page
    localStorage.removeItem('researchDocuments');
  }, [setDocuments]);

  // Delete a document
  const deleteDocument = useCallback(async (docId: string) => {
    try {
      // Extract the filename from the document ID
      const fileName = docId.replace('doc-', '');
      
      // Delete the file from storage
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([fileName]);
        
      if (error) {
        console.error("Error deleting file:", error);
        toast.error("Failed to delete document");
        return false;
      }
      
      // Update the documents state
      setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== docId));
      
      // Clear localStorage cache to force reload on the public page
      localStorage.removeItem('researchDocuments');
      
      toast.success("Document deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
      return false;
    }
  }, [bucketName, setDocuments]);

  // Update document metadata
  const updateDocumentMetadata = useCallback(async (docId: string, updatedData: Partial<ResearchDocument>) => {
    try {
      // Find the document to update
      const docIndex = documents.findIndex(doc => doc.id === docId);
      
      if (docIndex === -1) {
        toast.error("Document not found");
        return false;
      }
      
      // Get original document and filename
      const originalDoc = documents[docIndex];
      const fileName = originalDoc.id.replace('doc-', '');
      
      // Create new metadata search parameters
      const metadataParams = new URLSearchParams();
      metadataParams.append('title', updatedData.title || originalDoc.title);
      metadataParams.append('description', updatedData.description || originalDoc.description);
      metadataParams.append('category', updatedData.category || originalDoc.category);
      metadataParams.append('publishDate', updatedData.publishDate || originalDoc.publishDate);
      metadataParams.append('authors', updatedData.authors || originalDoc.authors || '');
      
      // Since we can't update metadata directly, we need to:
      // 1. Download the file
      const { data: fileData, error: downloadError } = await supabase.storage
        .from(bucketName)
        .download(fileName);
        
      if (downloadError) {
        console.error("Error downloading file:", downloadError);
        toast.error("Failed to update document metadata");
        return false;
      }
      
      if (!fileData) {
        toast.error("Could not download file for update");
        return false;
      }
      
      // 2. Delete the old file
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([fileName]);
        
      if (deleteError) {
        console.error("Error deleting file:", deleteError);
        toast.error("Failed to update document metadata");
        return false;
      }
      
      // 3. Re-upload with updated metadata in the filename
      // Split the filename to get the base and extension
      const baseFileName = fileName.split('?')[0];
      const fileExt = baseFileName.split('.').pop() || 'pdf';
      const newFileName = `${baseFileName.split('.')[0]}.${fileExt}?${metadataParams.toString()}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(newFileName, fileData, {
          contentType: `application/${fileExt}`,
          upsert: true
        });
        
      if (uploadError) {
        console.error("Error re-uploading file:", uploadError);
        toast.error("Failed to update document metadata");
        return false;
      }
      
      // Get the public URL of the updated file
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(newFileName);
        
      // 4. Update the document in state
      const updatedDoc = {
        ...originalDoc,
        ...updatedData,
        pdfUrl: urlData.publicUrl
      };
      
      const newDocs = [...documents];
      newDocs[docIndex] = updatedDoc;
      setDocuments(newDocs);
      
      // Clear localStorage cache to force reload on the public page
      localStorage.removeItem('researchDocuments');
      
      toast.success(`Document "${updatedDoc.title}" updated successfully`);
      return true;
    } catch (error) {
      console.error("Error updating document metadata:", error);
      toast.error("Failed to update document metadata");
      return false;
    }
  }, [documents, bucketName, setDocuments]);

  return {
    addDocument,
    deleteDocument,
    updateDocumentMetadata
  };
};
