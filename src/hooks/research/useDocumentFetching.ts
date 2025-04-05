
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
    setIsLoading(true);
    try {
      // First, try to load from local storage (cache)
      const cachedDocs = loadFromCache();
      if (cachedDocs) {
        setDocuments(cachedDocs);
      }
      
      // Fetch the list of files from the storage bucket
      const { data: files, error: filesError } = await supabase
        .storage
        .from('research_documents')
        .list();
        
      if (filesError) {
        console.error('Error fetching files:', filesError);
        if (!cachedDocs) {
          // If no cache and error, use fallback
          setDocuments(fallbackDocuments);
        }
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
      
      // If we have actual documents from storage, don't use fallback documents
      if (documentsList.length > 0) {
        const sortedDocs = sortDocumentsByDate(documentsList);
        
        // Cache the results
        saveToCache(sortedDocs);
        setDocuments(sortedDocs);
      } else {
        // Only use fallback documents if no actual documents exist
        setDocuments(fallbackDocuments);
      }
    } catch (err: any) {
      console.error('Error loading documents:', err);
      setError(err.message);
      
      // If we haven't set documents yet, use fallbacks
      const cachedDocs = loadFromCache();
      if (!cachedDocs) {
        setDocuments(fallbackDocuments);
      }
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

  return { fetchDocumentsFromStorage };
};
