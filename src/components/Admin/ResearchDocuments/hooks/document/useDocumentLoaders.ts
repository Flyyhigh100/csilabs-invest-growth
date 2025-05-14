
import { useCallback } from 'react';
import { toast } from 'sonner';
import { ResearchDocument } from '../../types/documentTypes';
import { useDocumentService } from './useDocumentService';

export const useDocumentLoaders = (
  setDocuments: (docs: ResearchDocument[]) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const { fetchDocumentsFromDb } = useDocumentService();

  // Load documents from database
  const loadDocumentsFromDb = useCallback(async () => {
    setIsLoading(true);
    try {
      const documents = await fetchDocumentsFromDb();
      
      console.log("Documents loaded from database:", documents.length);
      setDocuments(documents);
      
      // Cache the documents in localStorage for faster loading
      localStorage.setItem('researchDocuments', JSON.stringify(documents));
    } catch (error) {
      console.error("Error loading documents from database:", error);
      toast.error("Failed to load documents");
      
      // Fallback to cache if available
      const cachedDocs = localStorage.getItem('researchDocuments');
      if (cachedDocs) {
        console.log("Using cached documents");
        setDocuments(JSON.parse(cachedDocs));
      } else {
        setDocuments([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchDocumentsFromDb, setDocuments, setIsLoading]);

  // Legacy method for backward compatibility
  const loadDocumentsFromFile = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try to use loadDocumentsFromDb first
      await loadDocumentsFromDb();
    } catch (error) {
      console.error("Error loading documents, falling back to file method:", error);
      
      // Fetch the ResearchDocuments.tsx file content as fallback
      try {
        const response = await fetch('/src/pages/ResearchDocuments.tsx');
        const fileContent = await response.text();
        
        // Extract the documents array using regex
        const docsMatch = fileContent.match(/const\s+(?:fallback)?[dD]ocuments\s*=\s*\[([\s\S]*?)\];/);
        
        if (docsMatch && docsMatch[1]) {
          // Create a temporary function to evaluate the array
          const docs = eval(`[${docsMatch[1]}]`);
          setDocuments(docs);
        } else {
          toast.error("Could not parse research documents from file");
          setDocuments([]);
        }
      } catch (fileError) {
        console.error("Error loading documents from file:", fileError);
        toast.error("Failed to load research documents");
        setDocuments([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadDocumentsFromDb, setDocuments, setIsLoading]);

  return {
    loadDocumentsFromStorage: loadDocumentsFromDb,
    loadDocumentsFromFile
  };
};
