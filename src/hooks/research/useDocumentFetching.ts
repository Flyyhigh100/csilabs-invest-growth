
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DatabaseDocument, ResearchDocument, convertDatabaseToResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';
import { useDocumentCache } from './useDocumentCache';

export const useDocumentFetching = (
  setDocuments: React.Dispatch<React.SetStateAction<ResearchDocument[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<Error | null>>
) => {
  const { saveToCache, loadFromCache, clearCache } = useDocumentCache();

  const fetchDocumentsFromStorage = useCallback(async () => {
    console.log('Fetching documents...');
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to load from cache first
      try {
        const cachedDocuments = loadFromCache();
        
        if (cachedDocuments && cachedDocuments.length > 0) {
          console.log(`Loaded ${cachedDocuments.length} documents from cache`);
          setDocuments(cachedDocuments);
          
          // Continue fetching from DB in the background
          fetchFromDatabase(false);
          return;
        }
      } catch (cacheError) {
        console.error('Error loading from cache:', cacheError);
        // Clear the corrupted cache
        clearCache();
      }
      
      // No cache, fetch from database immediately
      await fetchFromDatabase(true);
    } catch (err) {
      console.error('Error in document fetching process:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred during document fetching'));
      setIsLoading(false);
    }
  }, [setDocuments, setIsLoading, setError, saveToCache, loadFromCache, clearCache]);
  
  const fetchFromDatabase = useCallback(async (updateLoadingState = true) => {
    try {
      if (updateLoadingState) {
        setIsLoading(true);
      }
      
      // Fetch documents from database
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching documents from database:', error);
        setError(new Error(error.message));
        if (updateLoadingState) {
          toast.error('Failed to load documents');
        }
        return;
      }
      
      if (!data || data.length === 0) {
        console.log('No documents found in database');
        setDocuments([]);
        setError(null);
        if (updateLoadingState) {
          setIsLoading(false);
        }
        return;
      }
      
      const freshDocuments = data.map((doc: DatabaseDocument) => 
        convertDatabaseToResearchDocument(doc)
      );
      
      console.log(`Fetched ${freshDocuments.length} documents from database`);
      setDocuments(freshDocuments);
      setError(null);
      
      // Save to cache only if not too many documents
      if (freshDocuments.length <= 20) {
        const cached = saveToCache(freshDocuments);
        if (!cached) {
          console.warn('Failed to save documents to cache due to size constraints');
        }
      } else {
        // Too many documents, don't cache them all
        const limitedDocs = freshDocuments.slice(0, 10);
        saveToCache(limitedDocs);
        console.log('Limited cache to 10 most recent documents');
      }
    } catch (err) {
      console.error('Exception fetching documents from database:', err);
      setError(err instanceof Error ? err : new Error('Unknown error during database fetch'));
      if (updateLoadingState) {
        toast.error('Error loading documents');
      }
    } finally {
      if (updateLoadingState) {
        setIsLoading(false);
      }
    }
  }, [setDocuments, setIsLoading, setError, saveToCache]);

  return { fetchDocumentsFromStorage, fetchFromDatabase };
};
