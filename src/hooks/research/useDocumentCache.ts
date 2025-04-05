
import { useCallback } from 'react';
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';

export const useDocumentCache = () => {
  // Save documents to local storage cache
  const saveToCache = useCallback((documents: ResearchDocument[]) => {
    try {
      localStorage.setItem('researchDocuments', JSON.stringify(documents));
    } catch (err) {
      console.error('Failed to save documents to cache:', err);
    }
  }, []);

  // Load documents from local storage cache
  const loadFromCache = useCallback((): ResearchDocument[] | null => {
    try {
      const cachedDocs = localStorage.getItem('researchDocuments');
      return cachedDocs ? JSON.parse(cachedDocs) : null;
    } catch (err) {
      console.error('Failed to load documents from cache:', err);
      return null;
    }
  }, []);

  // Clear the cache
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem('researchDocuments');
    } catch (err) {
      console.error('Failed to clear documents cache:', err);
    }
  }, []);

  return { saveToCache, loadFromCache, clearCache };
};
