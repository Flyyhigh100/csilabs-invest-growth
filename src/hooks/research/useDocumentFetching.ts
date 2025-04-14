
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';
import { useDocumentCache } from './useDocumentCache';
import { useFallbackDocuments } from './useFallbackDocuments';
import { useDocumentProcessor } from './useDocumentProcessor';
import { useBackgroundRefresh } from './useBackgroundRefresh';

export const useDocumentFetching = (
  setDocuments: (docs: ResearchDocument[]) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  const { saveToCache, loadFromCache } = useDocumentCache();
  const fallbackDocuments = useFallbackDocuments();
  const { processFiles } = useDocumentProcessor();
  const { refreshInBackground } = useBackgroundRefresh(setDocuments, saveToCache);

  // Fetch documents from Supabase storage
  const fetchDocumentsFromStorage = useCallback(async () => {
    // First, try to load from local storage cache immediately
    const cachedDocs = loadFromCache();
    if (cachedDocs && cachedDocs.length > 0) {
      console.log('Using cached documents:', cachedDocs.length);
      setDocuments(cachedDocs);
      setIsLoading(false);
      
      // Fetch fresh docs in background
      refreshInBackground();
      return;
    }
    
    // No cache available, show loading state and fetch
    setIsLoading(true);
    try {
      // Fetch the list of files from the storage bucket
      const { data: files, error: filesError } = await supabase
        .storage
        .from('research_documents')
        .list('', {
          limit: 100 // Add a higher limit to ensure we get all files
        });
        
      if (filesError) {
        console.error('Error fetching files:', filesError);
        setDocuments(fallbackDocuments);
        throw new Error(filesError.message);
      }

      if (!files || files.length === 0) {
        console.log('No files found in storage, using fallback documents');
        setDocuments(fallbackDocuments);
        setIsLoading(false);
        return;
      }

      // Process files into document objects
      const sortedDocs = await processFiles(files);
      
      // Cache the results
      saveToCache(sortedDocs);
      setDocuments(sortedDocs);
      console.log('Documents loaded:', sortedDocs.length);
    } catch (err: any) {
      console.error('Error loading documents:', err);
      setError(err.message);
      
      // If we haven't set documents yet, use fallbacks
      setDocuments(fallbackDocuments);
    } finally {
      setIsLoading(false);
    }
  }, [
    setIsLoading, 
    setDocuments, 
    setError, 
    loadFromCache, 
    saveToCache,
    fallbackDocuments,
    processFiles,
    refreshInBackground
  ]);

  return { fetchDocumentsFromStorage };
};
