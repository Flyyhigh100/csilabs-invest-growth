
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Utility function to update document categories in Supabase storage
 * @param documentIds Array of document IDs to update (format: "doc-filename.pdf")
 * @param categories Map of document IDs to their new categories
 * @returns Promise resolving to boolean indicating success/failure
 */
export const updateDocumentCategories = async (
  documentIds: string[],
  categories: Record<string, string>
): Promise<boolean> => {
  try {
    const bucketName = 'research_documents';
    let success = true;
    
    // Process each document
    for (const docId of documentIds) {
      // Extract filename from docId (remove "doc-" prefix)
      const fileName = docId.replace('doc-', '');
      
      // Skip if no category update for this document
      if (!categories[docId]) continue;
      
      // Check if this is a special case for fallback documents
      const isDefaultDoc = !fileName.includes('.');
      if (isDefaultDoc) {
        console.log(`Skipping fallback document ${docId} - only state will be updated`);
        continue; // Skip processing - these will be updated via state directly
      }

      console.log(`Updating document ${docId} to category ${categories[docId]}`);
      
      // Split filename to get base name and any existing query parameters
      const fileNameParts = fileName.split('?');
      const baseFileName = fileNameParts[0];
      const fileExt = baseFileName.split('.').pop() || 'pdf';
      
      // Create or update metadata parameters
      const metadataParams = new URLSearchParams(fileNameParts[1] || '');
      metadataParams.set('category', categories[docId]);
      
      // Download existing file
      console.log(`Downloading ${fileName}...`);
      const { data: fileData, error: downloadError } = await supabase.storage
        .from(bucketName)
        .download(fileName);
        
      if (downloadError) {
        console.error("Error downloading file:", downloadError);
        toast.error(`Failed to update ${docId}`);
        success = false;
        continue;
      }
      
      if (!fileData) {
        console.error("No file data returned");
        toast.error(`Failed to update ${docId}`);
        success = false;
        continue;
      }
      
      // Create new filename with updated metadata
      const newFileName = `${baseFileName.split('.')[0]}.${fileExt}?${metadataParams.toString()}`;
      
      // Re-upload with new filename
      console.log(`Re-uploading as ${newFileName}...`);
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(newFileName, fileData, {
          contentType: `application/${fileExt}`,
          upsert: true
        });
        
      if (uploadError) {
        console.error("Error re-uploading file:", uploadError);
        toast.error(`Failed to update ${docId}`);
        success = false;
        continue;
      }
      
      // If the filename changed, remove the old file
      if (fileName !== newFileName) {
        console.log(`Removing old file ${fileName}...`);
        await supabase.storage
          .from(bucketName)
          .remove([fileName]);
      }
    }
    
    // Clear local storage cache to force reload
    localStorage.removeItem('researchDocuments');
    
    if (success) {
      toast.success("Document categories updated successfully");
    }
    
    return success;
  } catch (error) {
    console.error("Error updating document categories:", error);
    toast.error("Failed to update document categories");
    return false;
  }
};
