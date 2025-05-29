
import { useState } from 'react';
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';
import { useFallbackDocuments } from './useFallbackDocuments';

// Define the custom document order priority
const DOCUMENT_ORDER_PRIORITY = [
  'Harvard Letter',
  'Report 1', 
  'Report 2',
  'Cancer Drug Comparables',
  'Fundraising Event',
  'Marketing Campaign',
  'Community Building',
  'Shareholder Communication',
  'Cryptocurrency Launch'
];

const getDocumentPriority = (document: ResearchDocument): number => {
  // Check title first (exact match)
  const titleIndex = DOCUMENT_ORDER_PRIORITY.findIndex(priority => 
    document.title.toLowerCase().includes(priority.toLowerCase())
  );
  
  if (titleIndex !== -1) {
    return titleIndex;
  }
  
  // Check category if title doesn't match
  const categoryIndex = DOCUMENT_ORDER_PRIORITY.findIndex(priority => 
    document.category.toLowerCase().includes(priority.toLowerCase())
  );
  
  if (categoryIndex !== -1) {
    return categoryIndex;
  }
  
  // If no match found, put at end with high priority number
  return 999;
};

const sortDocumentsByCustomOrder = (documents: ResearchDocument[]): ResearchDocument[] => {
  return [...documents].sort((a, b) => {
    const priorityA = getDocumentPriority(a);
    const priorityB = getDocumentPriority(b);
    
    // Sort by priority first
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // If same priority, sort alphabetically by title
    return a.title.localeCompare(b.title);
  });
};

export const useResearchState = () => {
  const fallbackDocs = useFallbackDocuments();
  const [documents, setDocuments] = useState<ResearchDocument[]>(fallbackDocs);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<ResearchDocument | null>(null);

  // Calculate categories from documents
  const categories = Array.from(new Set(documents.map(doc => doc.category)));
  
  // Filter documents based on selected category, then apply custom sorting
  const filteredDocuments = selectedCategory 
    ? sortDocumentsByCustomOrder(documents.filter(doc => doc.category === selectedCategory))
    : sortDocumentsByCustomOrder(documents);

  return {
    documents,
    setDocuments,
    isLoading,
    setIsLoading,
    error,
    setError,
    selectedCategory,
    setSelectedCategory,
    selectedPdf,
    setSelectedPdf,
    categories,
    filteredDocuments
  };
};
