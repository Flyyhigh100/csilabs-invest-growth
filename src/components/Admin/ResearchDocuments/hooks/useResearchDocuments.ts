
import { useEffect } from 'react';
import { useDocumentState } from './document/useDocumentState';
import { useAuthCheck } from './document/useAuthCheck';
import { useDocumentLoaders } from './document/useDocumentLoaders';
import { useDocumentMutations } from './document/useDocumentMutations';

export const useResearchDocuments = () => {
  const {
    documents,
    setDocuments,
    isLoading,
    setIsLoading,
    isAuthenticated,
    setIsAuthenticated
  } = useDocumentState();
  
  const checkAuthentication = useAuthCheck(setIsAuthenticated);
  
  const {
    loadDocumentsFromStorage,
    loadDocumentsFromFile
  } = useDocumentLoaders(setDocuments, setIsLoading);
  
  const {
    addDocument,
    uploadDocument,
    deleteDocument,
    updateDocumentMetadata
  } = useDocumentMutations(documents, setDocuments);

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
    isAuthenticated,
    loadDocumentsFromStorage,
    loadDocumentsFromFile,
    addDocument,
    uploadDocument,
    deleteDocument,
    checkAuthentication,
    updateDocumentMetadata
  };
};
