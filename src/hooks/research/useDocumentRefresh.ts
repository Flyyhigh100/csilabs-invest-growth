
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';
import { useDocumentCache } from './useDocumentCache';

export const useDocumentRefresh = (
  setDocuments: (docs: ResearchDocument[]) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  const { clearCache, saveToCache } = useDocumentCache();
  
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
        baseFileName.toLowerCase().includes('harvard')) {
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

      // Process files as before but without loading states
      const documentsList = await Promise.all(files.map(async (file) => {
        const fileName = file.name;
        const { data: urlData } = supabase.storage.from('research_documents').getPublicUrl(fileName);
        const baseFileName = getBaseFilename(fileName);
        
        // Use the parseFileMetadata helper function
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
      
      // Sort documents, ensuring proper date parsing
      const sortedDocs = documentsList.sort((a, b) => {
        const dateA = new Date(a.publishDate);
        const dateB = new Date(b.publishDate);
        
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          return a.publishDate.localeCompare(b.publishDate);
        }
        
        return dateB.getTime() - dateA.getTime();
      });
      
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
    getBaseFilename,
    parseFileMetadata
  ]);

  return { refreshDocuments };
};
