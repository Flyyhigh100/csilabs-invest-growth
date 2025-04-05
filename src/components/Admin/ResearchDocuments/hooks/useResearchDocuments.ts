
import { useState, useEffect, useCallback } from 'react';
import { ResearchDocument } from '../types/documentTypes';
import { checkBucketExists, listAllBuckets, createBucketIfNotExists } from '@/utils/admin/kyc/storage';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useResearchDocuments = () => {
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bucketExists, setBucketExists] = useState(false);
  const [bucketName] = useState('research_documents');
  const [availableBuckets, setAvailableBuckets] = useState<string[]>([]);
  const [isCheckingBucket, setIsCheckingBucket] = useState(false);
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

  // Check if the bucket exists
  const checkResearchBucket = useCallback(async () => {
    if (isCheckingBucket) return; // Prevent multiple simultaneous checks
    
    console.log("Checking bucket existence:", bucketName);
    setIsCheckingBucket(true);
    setIsLoading(true);
    
    try {
      // First check authentication
      const isAuthed = await checkAuthentication();
      if (!isAuthed) {
        console.log("User not authenticated, skipping bucket check");
        setIsLoading(false);
        setIsCheckingBucket(false);
        return;
      }
      
      // First check for the exact bucket name
      const exists = await checkBucketExists(bucketName);
      
      if (exists) {
        setBucketExists(true);
        console.log(`Found bucket with ID: ${bucketName}`);
        setIsLoading(false);
        setIsCheckingBucket(false);
        return;
      }
      
      // If not found, try to create it
      console.log(`Bucket '${bucketName}' not found, attempting to create it automatically...`);
      const created = await createBucketIfNotExists(bucketName);
      
      if (created) {
        console.log(`Successfully created bucket '${bucketName}'`);
        setBucketExists(true);
        setIsLoading(false);
        setIsCheckingBucket(false);
        return;
      }
      
      // If still not created, list all available buckets
      const buckets = await listAllBuckets();
      setAvailableBuckets(buckets);
      
      // Check for any research-related bucket
      const researchBucket = buckets.find(b => 
        b.toLowerCase().includes('research') || 
        b.toLowerCase().includes('document')
      );
      
      if (researchBucket) {
        setBucketExists(true);
        console.log(`Found alternative research bucket: ${researchBucket}`);
      } else {
        setBucketExists(false);
        console.log('No research bucket found. Available buckets:', buckets);
        
        // Show explicit error message about missing bucket
        toast.error("Storage bucket for research documents is not available. Please contact your administrator.");
      }
    } catch (error) {
      console.error("Error checking bucket:", error);
      toast.error("Failed to check storage bucket status");
    } finally {
      setIsLoading(false);
      setIsCheckingBucket(false);
    }
  }, [bucketName, isCheckingBucket, checkAuthentication]);

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
      await checkResearchBucket();
      await loadDocumentsFromFile();
    };
    
    init();
  }, [checkAuthentication, checkResearchBucket, loadDocumentsFromFile]);

  return {
    documents,
    isLoading,
    bucketExists,
    bucketName,
    availableBuckets,
    isAuthenticated,
    loadDocumentsFromFile,
    addDocument,
    checkResearchBucket,
    checkAuthentication
  };
};
