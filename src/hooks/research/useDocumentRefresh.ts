
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';
import { useDocumentCache } from './useDocumentCache';
import { useDocumentProcessor } from './useDocumentProcessor';

export const useDocumentRefresh = (
  setDocuments: (docs: ResearchDocument[]) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  const { clearCache, saveToCache } = useDocumentCache();
  const { processFiles } = useDocumentProcessor();
  
  // Add a function to reload documents from storage (for when we need to refresh)
  const refreshDocuments = useCallback(async () => {
    // Always clear the cache when explicitly refreshing
    console.log("Explicitly refreshing documents and clearing cache");
    clearCache();
    setIsLoading(true);
    
    try {
      const { data: files, error: filesError } = await supabase
        .storage
        .from('research_documents')
        .list('', { 
          sortBy: { column: 'name', order: 'asc' },
          limit: 100 // Add a higher limit to ensure we get all files
        });
        
      if (filesError) {
        console.error("Error listing files:", filesError);
        throw new Error(filesError.message || "Failed to list files");
      }
      
      if (!files || files.length === 0) {
        console.log("No files found in storage during refresh");
        setDocuments([]);
        setIsLoading(false);
        return;
      }
      
      console.log(`Found ${files.length} files during refresh`);

      // Process the files using our shared utility
      const sortedDocs = await processFiles(files);
      
      console.log(`Processed ${sortedDocs.length} documents during refresh`);
      saveToCache(sortedDocs);
      setDocuments(sortedDocs);
    } catch (err: any) {
      console.error("Error refreshing documents:", err);
      setError(err?.message || "Unknown error refreshing documents");
    } finally {
      setIsLoading(false);
    }
  }, [
    clearCache, 
    setIsLoading, 
    setDocuments, 
    setError, 
    saveToCache,
    processFiles
  ]);

  return { refreshDocuments };
};
