
import { useState } from 'react';
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';
import { useFallbackDocuments } from './useFallbackDocuments';

export const useResearchState = () => {
  const fallbackDocs = useFallbackDocuments();
  const [documents, setDocuments] = useState<ResearchDocument[]>(fallbackDocs);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<ResearchDocument | null>(null);

  // Calculate categories from documents
  const categories = Array.from(new Set(documents.map(doc => doc.category)));
  
  // Filter documents based on selected category
  const filteredDocuments = selectedCategory 
    ? documents.filter(doc => doc.category === selectedCategory) 
    : documents;

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
