
import { useEffect } from 'react';
import { useResearchState } from './useResearchState';
import { useDocumentFetching } from './useDocumentFetching';
import { useDocumentRefresh } from './useDocumentRefresh';

export const useResearchDocuments = () => {
  const {
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
  } = useResearchState();

  const { fetchDocumentsFromStorage } = useDocumentFetching(
    setDocuments,
    setIsLoading,
    setError
  );

  const { refreshDocuments } = useDocumentRefresh(
    setDocuments,
    setIsLoading,
    setError
  );

  // Load documents when the hook is first called
  useEffect(() => {
    fetchDocumentsFromStorage();
  }, [fetchDocumentsFromStorage]);

  return {
    documents,
    filteredDocuments,
    isLoading,
    error,
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedPdf,
    setSelectedPdf,
    refreshDocuments
  };
};

// Export the new hook for use in components
export default useResearchDocuments;
