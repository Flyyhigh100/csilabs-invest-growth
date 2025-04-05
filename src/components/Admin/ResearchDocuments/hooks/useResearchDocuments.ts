
import { useState, useEffect } from 'react';
import { ResearchDocument } from '../DocumentUploadForm';
import { checkBucketExists, listAllBuckets } from '@/utils/admin/kyc/storage';
import { toast } from 'sonner';

export const useResearchDocuments = () => {
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bucketExists, setBucketExists] = useState(false);
  const [bucketName, setBucketName] = useState('research_documents');
  const [availableBuckets, setAvailableBuckets] = useState<string[]>([]);

  // Check if the bucket exists
  const checkResearchBucket = async () => {
    // First check for the exact bucket name
    const exists = await checkBucketExists(bucketName);
    if (exists) {
      setBucketExists(true);
      console.log(`Found bucket with ID: ${bucketName}`);
      return;
    }
    
    // If not found, list all available buckets
    const buckets = await listAllBuckets();
    setAvailableBuckets(buckets);
    
    // Check for any research-related bucket
    const researchBucket = buckets.find(b => 
      b.toLowerCase().includes('research') || 
      b.toLowerCase().includes('document')
    );
    
    if (researchBucket) {
      setBucketName(researchBucket);
      setBucketExists(true);
      console.log(`Found alternative research bucket: ${researchBucket}`);
      toast.success(`Using existing bucket: ${researchBucket}`);
    } else {
      toast.error("Storage bucket not configured. Contact your administrator.");
      console.log('Available buckets:', buckets);
    }
  };

  // Load documents from file
  const loadDocumentsFromFile = async () => {
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
  };

  // Add a new document
  const addDocument = (newDocument: ResearchDocument) => {
    setDocuments(prevDocs => [...prevDocs, newDocument]);
  };

  useEffect(() => {
    checkResearchBucket();
    loadDocumentsFromFile();
  }, []);

  return {
    documents,
    isLoading,
    bucketExists,
    bucketName,
    availableBuckets,
    loadDocumentsFromFile,
    addDocument
  };
};
