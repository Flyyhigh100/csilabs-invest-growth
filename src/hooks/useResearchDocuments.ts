
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';

// Default/fallback documents in case storage loading fails
const fallbackDocuments: ResearchDocument[] = [
  {
    id: "doc-1",
    title: "Cannabinoids as Antioxidants and Neuroprotectants",
    description: "US Patent #6,630,507 details cannabinoids as potent antioxidants with neuroprotective properties, potentially useful for treating oxidative stress-related diseases.",
    category: "Patents",
    pdfUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3f/US-PatentTrademarkOffice-Patent6630507.pdf",
    publishDate: "October 7, 2003",
    authors: "Hampson et al., US Department of Health and Human Services"
  },
  {
    id: "doc-2",
    title: "Cannabis and Cannabinoid Research in Cancer",
    description: "Comprehensive research on the effects of cannabinoids on various cancer cell types and mechanisms of action.",
    category: "Clinical Research",
    pdfUrl: "/sample.pdf",
    publishDate: "March 15, 2022",
    authors: "CSi Labs Research Team"
  }
];

export const useResearchDocuments = () => {
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<ResearchDocument | null>(null);

  // Fetch documents from Supabase storage
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        // First, try to load from local storage (cache)
        const cachedDocs = localStorage.getItem('researchDocuments');
        if (cachedDocs) {
          setDocuments(JSON.parse(cachedDocs));
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
            
          // Default values
          let title = "Untitled Research Document";
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
          
          return {
            id: `doc-${fileName}`,
            title,
            description,
            category,
            pdfUrl: urlData.publicUrl,
            publishDate,
            authors
          } as ResearchDocument;
        });

        const documentsList = await Promise.all(filePromises);
        
        // If we have actual documents from storage, don't use fallback documents
        if (documentsList.length > 0) {
          // Cache the results
          localStorage.setItem('researchDocuments', JSON.stringify(documentsList));
          setDocuments(documentsList);
        } else {
          // Only use fallback documents if no actual documents exist
          setDocuments(fallbackDocuments);
        }
      } catch (err: any) {
        console.error('Error loading documents:', err);
        setError(err.message);
        
        // If we haven't set documents yet, use fallbacks
        if (documents.length === 0) {
          setDocuments(fallbackDocuments);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const categories = Array.from(new Set(documents.map(doc => doc.category)));
  
  const filteredDocuments = selectedCategory 
    ? documents.filter(doc => doc.category === selectedCategory) 
    : documents;

  return {
    documents,
    filteredDocuments,
    isLoading,
    error,
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedPdf,
    setSelectedPdf
  };
};
