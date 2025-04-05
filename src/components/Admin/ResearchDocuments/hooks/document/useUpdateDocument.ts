
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ResearchDocument } from '../../types/documentTypes';

export const useUpdateDocument = (
  documents: ResearchDocument[],
  setDocuments: React.Dispatch<React.SetStateAction<ResearchDocument[]>>,
  bucketName: string
) => {
  // Update document metadata
  const updateDocumentMetadata = useCallback(async (docId: string, updatedData: Partial<ResearchDocument>) => {
    try {
      console.log("Updating document metadata:", docId, updatedData);
      
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
      
      // Ensure all metadata fields are properly set
      metadataParams.append('title', updatedData.title || originalDoc.title);
      metadataParams.append('description', updatedData.description || originalDoc.description);
      metadataParams.append('category', updatedData.category || originalDoc.category);
      
      // Ensure the publishDate is being correctly passed and normalized
      const publishDate = updatedData.publishDate || originalDoc.publishDate;
      metadataParams.append('publishDate', publishDate);
      console.log("Setting publish date to:", publishDate);
      
      // Add authors if available
      if (updatedData.authors || originalDoc.authors) {
        metadataParams.append('authors', updatedData.authors || originalDoc.authors || '');
      }
      
      // Log metadata parameters for debugging
      console.log("Metadata parameters:", Object.fromEntries(metadataParams.entries()));
      
      // Check if it's one of the fallback documents (which don't exist in storage)
      const isDefaultDoc = !fileName.includes('.');
      
      let updatedDoc: ResearchDocument;
      
      if (isDefaultDoc) {
        // For default documents, just update the state without touching storage
        updatedDoc = {
          ...originalDoc,
          ...updatedData
        };
        
        console.log("Updated default document:", updatedDoc);
      } else {
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
        const fileNameParts = fileName.split('?');
        const baseFileName = fileNameParts[0];
        const fileExt = baseFileName.split('.').pop() || 'pdf';
        const newFileName = `${baseFileName.split('.')[0]}.${fileExt}?${metadataParams.toString()}`;
        
        console.log("New filename with metadata:", newFileName);
        
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
          
        // Create the updated document
        updatedDoc = {
          ...originalDoc,
          ...updatedData,
          pdfUrl: urlData.publicUrl
        };
        
        console.log("Updated storage document:", updatedDoc);
      }
      
      // 4. Update the document in state
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

  return { updateDocumentMetadata };
};
