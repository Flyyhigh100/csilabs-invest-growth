
import { useState, useEffect, useCallback } from 'react';
import { ResearchDocument } from '../types/documentTypes';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useResearchDocuments = () => {
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bucketName] = useState('research_documents');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  const checkAuthentication = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const isAuthed = !!data.session;
      setIsAuthenticated(isAuthed);
      console.log("Authentication check:", isAuthed ? "User is authenticated" : "User is not authenticated");
      return isAuthed;
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // Load documents from Supabase storage
  const loadDocumentsFromStorage = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch files from storage
      const { data: files, error } = await supabase
        .storage
        .from(bucketName)
        .list();
      
      if (error) {
        console.error("Error fetching files from storage:", error);
        toast.error("Failed to load documents from storage");
        
        // Fallback to file if storage fails
        await loadDocumentsFromFile();
        return;
      }
      
      if (!files || files.length === 0) {
        console.log("No files found in storage, loading from file instead");
        await loadDocumentsFromFile();
        return;
      }
      
      // Convert files to document objects
      const docsPromises = files.map(async (file) => {
        // Get file public URL
        const { data: urlData } = supabase
          .storage
          .from(bucketName)
          .getPublicUrl(file.name);
          
        // Try to extract metadata from filename or parameters
        let title = file.name.split('.')[0].split('-').slice(1).join(' ');
        let category = "Research";
        let description = `Research document: ${title}`;
        let publishDate = new Date().toLocaleDateString();
        let authors = "";
        
        // Parse file name for metadata, looking for URL-style parameters
        const fileNameParts = file.name.split('?');
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
          id: `doc-${file.name}`,
          title,
          description,
          category,
          pdfUrl: urlData.publicUrl,
          publishDate,
          authors
        };
      });
      
      const loadedDocs = await Promise.all(docsPromises);
      console.log("Documents loaded from storage:", loadedDocs.length);
      setDocuments(loadedDocs);
    } catch (error) {
      console.error("Error loading documents from storage:", error);
      toast.error("Failed to load documents from storage");
      
      // Fallback to file loading
      await loadDocumentsFromFile();
    } finally {
      setIsLoading(false);
    }
  }, [bucketName]);

  // Load documents from file (legacy method)
  const loadDocumentsFromFile = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch the ResearchDocuments.tsx file content
      const response = await fetch('/src/pages/ResearchDocuments.tsx');
      const fileContent = await response.text();
      
      // Extract the documents array using regex
      const docsMatch = fileContent.match(/const\s+(?:fallback)?[dD]ocuments\s*=\s*\[([\s\S]*?)\];/);
      
      if (docsMatch && docsMatch[1]) {
        // Create a temporary function to evaluate the array
        // This is hacky but works for simple JSON-like structures
        const docs = eval(`[${docsMatch[1]}]`);
        setDocuments(docs);
      } else {
        toast.error("Could not parse research documents from file");
        setDocuments([]);
      }
    } catch (error) {
      console.error("Error loading documents from file:", error);
      toast.error("Failed to load research documents");
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a new document
  const addDocument = useCallback((newDocument: ResearchDocument) => {
    setDocuments(prevDocs => [...prevDocs, newDocument]);
    toast.success(`Document "${newDocument.title}" added successfully`);
    
    // Clear localStorage cache to force reload on the public page
    localStorage.removeItem('researchDocuments');
  }, []);

  useEffect(() => {
    const init = async () => {
      await checkAuthentication();
      await loadDocumentsFromStorage();
    };
    
    init();
  }, [checkAuthentication, loadDocumentsFromStorage]);

  return {
    documents,
    isLoading,
    bucketName,
    isAuthenticated,
    loadDocumentsFromStorage,
    loadDocumentsFromFile,
    addDocument,
    checkAuthentication
  };
};
