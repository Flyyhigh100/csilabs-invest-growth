
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
    bucketName,
    isAuthenticated,
    setIsAuthenticated
  } = useDocumentState();
  
  const checkAuthentication = useAuthCheck(setIsAuthenticated);
  
  const {
    loadDocumentsFromStorage,
    loadDocumentsFromFile
  } = useDocumentLoaders(setDocuments, setIsLoading, bucketName);
  
  const {
    addDocument,
    deleteDocument,
    updateDocumentMetadata
  } = useDocumentMutations(documents, setDocuments, bucketName);

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
    deleteDocument,
    checkAuthentication,
    updateDocumentMetadata
  };
};
