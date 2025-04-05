
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

  // Add a function to reload documents from storage (for when we need to refresh)
  const refreshDocuments = useCallback(async () => {
    clearCache();
    setIsLoading(true);
    
    try {
      const { data: files, error: filesError } = await supabase
        .storage
        .from('research_documents')
        .list();
        
      if (filesError || !files || files.length === 0) {
        throw new Error(filesError?.message || "No files found");
      }
      
      const documentsList = await Promise.all(files.map(async (file) => {
        const fileName = file.name;
        
        const { data: urlData } = supabase
          .storage
          .from('research_documents')
          .getPublicUrl(fileName);
          
        const baseFileName = getBaseFilename(fileName);
        let title = baseFileName
          .split('.')[0]
          .replace(/_/g, ' ')
          .replace(/-/g, ' ')
          .replace(/^\d+\s*/, '');
        
        let category = "Research";
        let publishDate = new Date().toLocaleDateString();
        let authors = "";
        let description = "";
        
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
        
        return {
          id: `doc-${fileName}`,
          title,
          description,
          category,
          pdfUrl: urlData.publicUrl,
          publishDate,
          authors
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
      
      saveToCache(sortedDocs);
      setDocuments(sortedDocs);
    } catch (err: any) {
      console.error("Error refreshing documents:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [clearCache, setIsLoading, setDocuments, setError, saveToCache, getBaseFilename]);

  return { refreshDocuments };
};
