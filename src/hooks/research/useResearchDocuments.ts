
import { useEffect, useRef } from 'react';
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
  
  // Add a initialization flag to ensure we only fetch once
  const initialized = useRef(false);

  // Load documents when the hook is first called - with empty dependency array to run only once
  useEffect(() => {
    if (!initialized.current) {
      console.log("Initial document fetch");
      initialized.current = true;
      fetchDocumentsFromStorage();
    }
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
