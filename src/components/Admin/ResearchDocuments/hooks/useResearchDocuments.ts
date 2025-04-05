
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

  // Load documents from file
  const loadDocumentsFromFile = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch the ResearchDocuments.tsx file content
      const response = await fetch('/src/pages/ResearchDocuments.tsx');
      const fileContent = await response.text();
      
      // Extract the documents array using regex
      const docsMatch = fileContent.match(/const\s+researchDocuments\s*=\s*\[([\s\S]*?)\];/);
      
      if (docsMatch && docsMatch[1]) {
        // Create a temporary function to evaluate the array
        // This is hacky but works for simple JSON-like structures
        const docs = eval(`[${docsMatch[1]}]`);
        setDocuments(docs);
      } else {
        toast.error("Could not parse research documents from file");
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      toast.error("Failed to load research documents");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a new document
  const addDocument = useCallback((newDocument: ResearchDocument) => {
    setDocuments(prevDocs => [...prevDocs, newDocument]);
    toast.success(`Document "${newDocument.title}" added successfully`);
  }, []);

  useEffect(() => {
    const init = async () => {
      await checkAuthentication();
      await loadDocumentsFromFile();
    };
    
    init();
  }, [checkAuthentication, loadDocumentsFromFile]);

  return {
    documents,
    isLoading,
    bucketName,
    isAuthenticated,
    loadDocumentsFromFile,
    addDocument,
    checkAuthentication
  };
};
