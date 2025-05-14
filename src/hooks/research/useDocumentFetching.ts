
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

  // Helper function to extract actual filename without params
  const getBaseFilename = useCallback((fullName: string): string => {
    return fullName.split('?')[0];
  }, []);

  // Parse metadata from file name with URL parameters
  const parseFileMetadata = useCallback((fileName: string, baseFileName: string) => {
    // Default values (use filename as title if nothing else available)
    let title = baseFileName
      .split('.')[0]
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/^\d+\s*/, ''); // Remove any leading numbers and timestamp
          
    // Special case for Harvard document
    if (title.toLowerCase().includes('harvard') || 
        (baseFileName.toLowerCase().includes('harvard'))) {
      return {
        title: title,
        category: "Harvard Letter",
        description: "",
        publishDate: new Date().toLocaleDateString(),
        authors: ""
      };
    }
    
    let category = "Research";
    let publishDate = new Date().toLocaleDateString();
    let authors = "";
    let description = "";
    
    // Parse file name for metadata with URL parameters
    const fileNameParts = fileName.split('?');
    if (fileNameParts.length > 1) {
      try {
        const params = new URLSearchParams(fileNameParts[1]);
        title = params.get('title') || title;
        category = params.get('category') || category;
        description = params.get('description') || description;
        publishDate = params.get('publishDate') || publishDate;
        authors = params.get('authors') || authors;
      } catch (e) {
        console.log("Could not parse metadata from filename");
      }
    }
    
    return { title, category, description, publishDate, authors };
  }, []);

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

  // Fetch documents from Supabase storage
  const fetchDocumentsFromStorage = useCallback(async () => {
    // First, clear cache to ensure fresh data
    localStorage.removeItem('researchDocuments');
    
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

      // Get metadata for each file
      const filePromises = files.map(async (file) => {
        const fileName = file.name;
        
        // Get the public URL
        const { data: urlData } = supabase
          .storage
          .from('research_documents')
          .getPublicUrl(fileName);
          
        const baseFileName = getBaseFilename(fileName);
        const metadata = parseFileMetadata(fileName, baseFileName);
        
        return {
          id: `doc-${fileName}`,
          title: metadata.title,
          description: metadata.description,
          category: metadata.category,
          pdfUrl: urlData.publicUrl,
          publishDate: metadata.publishDate,
          authors: metadata.authors
        } as ResearchDocument;
      });

      const documentsList = await Promise.all(filePromises);
      
      // Combine storage documents with fallbacks
      // This ensures the Harvard document is always included
      const combinedDocs = [...documentsList];
      
      // Check if we need to add fallback documents 
      // Add Harvard document from fallback if not present
      const hasHarvard = combinedDocs.some(doc => 
        doc.category === "Harvard Letter" || 
        doc.title.toLowerCase().includes('harvard')
      );
      
      if (!hasHarvard && fallbackDocuments.length > 0) {
        combinedDocs.push(fallbackDocuments[0]);
      }
      
      const sortedDocs = sortDocumentsByDate(combinedDocs);
      
      // Cache the results
      saveToCache(sortedDocs);
      setDocuments(sortedDocs);
      console.log('Documents loaded from storage and fallback:', sortedDocs.length);
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
    getBaseFilename,
    parseFileMetadata,
    sortDocumentsByDate,
    fallbackDocuments
  ]);

  // Background refresh function that doesn't set loading state
  const refreshInBackground = useCallback(async () => {
    try {
      const { data: files, error: filesError } = await supabase
        .storage
        .from('research_documents')
        .list('', {
          limit: 100 // Add a higher limit to ensure we get all files
        });
        
      if (filesError || !files || files.length === 0) {
        return; // Just return silently as this is a background refresh
      }

      // Process files as before but without loading states
      const documentsList = await Promise.all(files.map(async (file) => {
        const fileName = file.name;
        const { data: urlData } = supabase.storage.from('research_documents').getPublicUrl(fileName);
        const baseFileName = getBaseFilename(fileName);
        const metadata = parseFileMetadata(fileName, baseFileName);
        
        return {
          id: `doc-${fileName}`,
          title: metadata.title,
          description: metadata.description,
          category: metadata.category,
          pdfUrl: urlData.publicUrl,
          publishDate: metadata.publishDate,
          authors: metadata.authors
        } as ResearchDocument;
      }));
      
      if (documentsList.length > 0) {
        const sortedDocs = sortDocumentsByDate(documentsList);
        saveToCache(sortedDocs);
        setDocuments(sortedDocs);
        console.log('Background refresh completed with', sortedDocs.length, 'documents');
      }
    } catch (err) {
      console.error('Background refresh error:', err);
      // Don't set error state as this is a background operation
    }
  }, [
    getBaseFilename,
    parseFileMetadata,
    saveToCache,
    setDocuments,
    sortDocumentsByDate
  ]);

  return { fetchDocumentsFromStorage };
};
