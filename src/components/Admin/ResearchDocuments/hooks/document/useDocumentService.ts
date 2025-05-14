
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
  
  // Upload document to storage and add metadata to the database using edge function as fallback
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
    // Validate file size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File exceeds the 10MB size limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      throw new Error("File size exceeds limit");
    }
    
    // Validate file type
    if (!file.type.includes('pdf')) {
      toast.error('Only PDF files are supported');
      throw new Error("Invalid file type");
    }
    
    try {
      // Try direct upload first
      return await tryDirectUpload(file, metadata);
    } catch (directError) {
      console.error('Direct upload failed, trying fallback method:', directError);
      toast.info('Trying alternate upload method...');
      
      // If direct upload fails, try edge function fallback
      try {
        return await tryEdgeFunctionUpload(file, metadata);
      } catch (fallbackError) {
        console.error('Fallback upload also failed:', fallbackError);
        toast.error('All upload methods failed. Please try again later.');
        throw new Error(`Upload failed: ${fallbackError.message}`);
      }
    }
  }, []);

  // Direct upload using client permissions
  const tryDirectUpload = async (file: File, metadata: any): Promise<ResearchDocument> => {
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const safeTitle = metadata.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filePath = `${timestamp}_${safeTitle}.${fileExt}`;
    
    console.log(`Attempting direct upload: ${filePath}`);
    
    // 1. Check if storage bucket exists first
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'research_documents');
    
    if (!bucketExists) {
      console.error('Storage bucket "research_documents" does not exist');
      throw new Error('Storage bucket not found');
    }
    
    // 2. Upload file to storage
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('research_documents')
      .upload(filePath, file, {
        contentType: `application/pdf`,
        upsert: true
      });
      
    if (uploadError) {
      console.error('Error uploading file to storage:', uploadError);
      throw uploadError;
    }
    
    // 3. Get public URL for the file
    const { data: publicUrlData } = supabase.storage
      .from('research_documents')
      .getPublicUrl(filePath);
      
    const fileUrl = publicUrlData.publicUrl;
    console.log('File uploaded successfully, URL:', fileUrl);
    
    // Get current user's ID for created_by field
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    // 4. Insert document metadata into database
    const { data: insertData, error: insertError } = await supabase
      .from('documents')
      .insert({
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        file_path: fileUrl,
        published_at: new Date(metadata.publishDate).toISOString(),
        authors: metadata.authors || null,
        created_by: userId
      })
      .select()
      .single();
      
    if (insertError) {
      console.error('Error inserting document metadata:', insertError);
      
      // Clean up the uploaded file since metadata insertion failed
      await supabase.storage
        .from('research_documents')
        .remove([filePath]);
        
      throw insertError;
    }
    
    console.log('Document uploaded successfully via direct method:', insertData);
    
    // Return the newly created document
    return convertDatabaseToResearchDocument(insertData as DatabaseDocument);
  };
  
  // Fallback upload using edge function (bypasses RLS)
  const tryEdgeFunctionUpload = async (file: File, metadata: any): Promise<ResearchDocument> => {
    console.log('Attempting fallback upload via edge function');
    
    // Get current user's ID
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Read file as base64
    const fileBase64 = await readFileAsBase64(file);
    
    // Call the edge function to upload the document
    const { data, error } = await supabase.functions.invoke('upload-research-document', {
      body: {
        fileName: file.name,
        fileBase64,
        metadata,
        userId
      }
    });
    
    if (error) {
      console.error('Error calling upload function:', error);
      throw error;
    }
    
    if (!data || data.error) {
      console.error('Function returned error:', data?.error || 'Unknown error');
      throw new Error(data?.error || 'Unknown error');
    }
    
    console.log('Document uploaded successfully via edge function:', data.document);
    
    // Return the document from the edge function response
    return convertDatabaseToResearchDocument(data.document as DatabaseDocument);
  };
  
  // Helper function to read file as base64
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };
  
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
