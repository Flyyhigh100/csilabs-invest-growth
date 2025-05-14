
import { useCallback } from 'react';
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';

export const useDocumentCache = () => {
  // Save documents to local storage cache with size limit checking
  const saveToCache = useCallback((documents: ResearchDocument[]) => {
    try {
      // Limit the number of documents stored to prevent quota issues
      const MAX_DOCS_TO_CACHE = 10;
      const docsToCache = documents.slice(0, MAX_DOCS_TO_CACHE);
      
      // Estimate size before storing
      const dataString = JSON.stringify(docsToCache);
      const estimatedSize = new Blob([dataString]).size;
      
      // Local storage typically has 5-10MB limit
      // Use 3MB as a safe threshold
      const MAX_CACHE_SIZE_BYTES = 3 * 1024 * 1024; // 3MB
      
      if (estimatedSize > MAX_CACHE_SIZE_BYTES) {
        console.warn(`Cache data too large (${(estimatedSize / 1024 / 1024).toFixed(2)}MB), not saving to localStorage`);
        return false;
      }
      
      localStorage.setItem('researchDocuments', dataString);
      return true;
    } catch (err) {
      // Handle quota exceeded or other errors
      console.error('Failed to save documents to cache:', err);
      
      // Try to clear the cache if it might be a storage issue
      try {
        localStorage.removeItem('researchDocuments');
      } catch (clearError) {
        console.error('Failed to clear cache after error:', clearError);
      }
      
      return false;
    }
  }, []);

  // Load documents from local storage cache
  const loadFromCache = useCallback((): ResearchDocument[] | null => {
    try {
      const cachedDocs = localStorage.getItem('researchDocuments');
      return cachedDocs ? JSON.parse(cachedDocs) : null;
    } catch (err) {
      console.error('Failed to load documents from cache:', err);
      
      // Try to clear the corrupted cache
      try {
        localStorage.removeItem('researchDocuments');
      } catch (clearError) {
        console.error('Failed to clear corrupted cache:', clearError);
      }
      
      return null;
    }
  }, []);

  // Clear the cache
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem('researchDocuments');
      return true;
    } catch (err) {
      console.error('Failed to clear documents cache:', err);
      return false;
    }
  }, []);

  return { saveToCache, loadFromCache, clearCache };
};
