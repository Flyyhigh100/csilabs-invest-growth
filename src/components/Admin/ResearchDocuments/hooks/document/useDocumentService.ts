
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  DatabaseDocument, 
  ResearchDocument, 
  convertDatabaseToResearchDocument 
} from '../../types/documentTypes';

export const useDocumentService = () => {
  // Get all documents from the database
  const fetchDocumentsFromDb = useCallback(async (): Promise<ResearchDocument[]> => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('published_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching documents from database:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('No documents found in database');
        return [];
      }
      
      // Convert database documents to research documents
      return data.map((doc: DatabaseDocument) => convertDatabaseToResearchDocument(doc));
    } catch (error) {
      console.error('Exception fetching documents from database:', error);
      throw error;
    }
  }, []);
  
  // Upload a document to storage and add metadata to the database
  const uploadDocument = useCallback(async (
    file: File, 
    metadata: { 
      title: string; 
      description: string; 
      category: string; 
      publishDate: string;
      authors?: string;
    }
  ): Promise<ResearchDocument> => {
    // Check for authentication
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast.error("You must be logged in to upload documents");
      throw new Error("Authentication required");
    }
    
    try {
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const safeTitle = metadata.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const filePath = `${timestamp}_${safeTitle}.${fileExt}`;
      
      console.log(`Uploading file to storage: ${filePath}`);
      
      // 1. Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('research_documents')
        .upload(filePath, file, {
          contentType: `application/${fileExt}`,
          upsert: true
        });
        
      if (uploadError) {
        console.error('Error uploading file to storage:', uploadError);
        toast.error(`Upload failed: ${uploadError.message}`);
        throw uploadError;
      }
      
      // 2. Get public URL for the file
      const { data: publicUrlData } = supabase.storage
        .from('research_documents')
        .getPublicUrl(filePath);
        
      const fileUrl = publicUrlData.publicUrl;
      
      // 3. Insert document metadata into database
      const { data: insertData, error: insertError } = await supabase
        .from('documents')
        .insert({
          title: metadata.title,
          description: metadata.description,
          category: metadata.category,
          file_path: fileUrl,
          published_at: new Date(metadata.publishDate).toISOString(),
          authors: metadata.authors || null,
          created_by: sessionData.session.user.id
        })
        .select()
        .single();
        
      if (insertError) {
        console.error('Error inserting document metadata:', insertError);
        toast.error(`Failed to save document metadata: ${insertError.message}`);
        
        // Clean up the uploaded file since metadata insertion failed
        await supabase.storage
          .from('research_documents')
          .remove([filePath]);
          
        throw insertError;
      }
      
      console.log('Document uploaded successfully:', insertData);
      
      // Return the newly created document
      return convertDatabaseToResearchDocument(insertData as DatabaseDocument);
    } catch (error) {
      console.error('Error in document upload process:', error);
      throw error;
    }
  }, []);
  
  // Delete a document from storage and database
  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    try {
      // 1. Fetch the document to get the file path
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching document for deletion:', fetchError);
        toast.error(`Failed to delete document: ${fetchError.message}`);
        throw fetchError;
      }
      
      // Extract the filename from the full URL
      const url = new URL(document.file_path);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      console.log(`Deleting file from storage: ${fileName}`);
      
      // 2. Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('research_documents')
        .remove([fileName]);
        
      if (storageError) {
        console.error('Error removing file from storage:', storageError);
        // Continue with metadata deletion even if file deletion failed
        console.log('Continuing with metadata deletion despite storage error');
      }
      
      // 3. Delete the document metadata from the database
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
        
      if (deleteError) {
        console.error('Error deleting document metadata:', deleteError);
        toast.error(`Failed to delete document metadata: ${deleteError.message}`);
        throw deleteError;
      }
      
      console.log('Document deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in document deletion process:', error);
      toast.error('Failed to delete document');
      return false;
    }
  }, []);
  
  // Update document metadata
  const updateDocumentMetadata = useCallback(async (
    documentId: string, 
    metadata: Partial<ResearchDocument>
  ): Promise<boolean> => {
    try {
      // Convert any date objects to ISO strings
      const updatedData: any = { ...metadata };
      if (metadata.publishDate) {
        updatedData.published_at = new Date(metadata.publishDate).toISOString();
        delete updatedData.publishDate;
      }
      
      // Remove fields that don't map to the database schema
      delete updatedData.id;
      delete updatedData.pdfUrl;
      
      console.log(`Updating document metadata for ID: ${documentId}`, updatedData);
      
      const { error } = await supabase
        .from('documents')
        .update(updatedData)
        .eq('id', documentId);
        
      if (error) {
        console.error('Error updating document metadata:', error);
        toast.error(`Failed to update document: ${error.message}`);
        throw error;
      }
      
      console.log('Document metadata updated successfully');
      return true;
    } catch (error) {
      console.error('Error in document update process:', error);
      toast.error('Failed to update document metadata');
      return false;
    }
  }, []);

  return {
    fetchDocumentsFromDb,
    uploadDocument,
    deleteDocument,
    updateDocumentMetadata
  };
};
