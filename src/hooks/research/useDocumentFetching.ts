
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';
import { useDocumentCache } from './useDocumentCache';
import { useFallbackDocuments } from './useFallbackDocuments';

export const useDocumentFetching = (
  setDocuments: (docs: ResearchDocument[]) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  const { saveToCache, loadFromCache } = useDocumentCache();
  const fallbackDocuments = useFallbackDocuments();

  // Sort documents by publish date
  const sortDocumentsByDate = useCallback((documents: ResearchDocument[]): ResearchDocument[] => {
    return documents.sort((a, b) => {
      // Try to parse dates in various formats for better comparison
      const dateA = new Date(a.publishDate);
      const dateB = new Date(b.publishDate);
      
      // Check if dates are valid, if not use string comparison
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        return a.publishDate.localeCompare(b.publishDate);
      }
      
      return dateB.getTime() - dateA.getTime();
    });
  }, []);

  // Fetch documents from database
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
      // Fetch documents from the database
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('published_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching documents from database:', error);
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        console.log('No documents found in database, using fallback documents');
        setDocuments(fallbackDocuments);
        setIsLoading(false);
        return;
      }

      // Convert database format to our application format
      const documentsList = data.map(doc => ({
        id: doc.id,
        title: doc.title,
        description: doc.description || '',
        category: doc.category,
        pdfUrl: doc.file_path,
        publishDate: new Date(doc.published_at).toISOString().split('T')[0],
        authors: doc.authors || ''
      }));
      
      // Combine with fallback documents if needed
      const combinedDocs = [...documentsList, ...fallbackDocuments];
      
      // Remove duplicates (if any fallback docs match real docs)
      const uniqueDocs = combinedDocs.filter(
        (doc, index, self) => 
          index === self.findIndex(d => d.title === doc.title)
      );
      
      const sortedDocs = sortDocumentsByDate(uniqueDocs);
      
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
    sortDocumentsByDate,
    fallbackDocuments
  ]);

  // Background refresh function that doesn't set loading state
  const refreshInBackground = useCallback(async () => {
    try {
      // Fetch documents from the database
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('published_at', { ascending: false });
        
      if (error || !data) {
        return; // Just return silently as this is a background refresh
      }

      // Convert database format to our application format
      const documentsList = data.map(doc => ({
        id: doc.id,
        title: doc.title,
        description: doc.description || '',
        category: doc.category,
        pdfUrl: doc.file_path,
        publishDate: new Date(doc.published_at).toISOString().split('T')[0],
        authors: doc.authors || ''
      }));
      
      // Combine with fallback documents
      const combinedDocs = [...documentsList, ...fallbackDocuments];
      
      // Remove duplicates
      const uniqueDocs = combinedDocs.filter(
        (doc, index, self) => 
          index === self.findIndex(d => d.title === doc.title)
      );
      
      if (uniqueDocs.length > 0) {
        const sortedDocs = sortDocumentsByDate(uniqueDocs);
        saveToCache(sortedDocs);
        setDocuments(sortedDocs);
        console.log('Background refresh completed with', sortedDocs.length, 'documents');
      }
    } catch (err) {
      console.error('Background refresh error:', err);
      // Don't set error state as this is a background operation
    }
  }, [
    saveToCache,
    setDocuments,
    sortDocumentsByDate,
    fallbackDocuments
  ]);

  return { fetchDocumentsFromStorage };
};
