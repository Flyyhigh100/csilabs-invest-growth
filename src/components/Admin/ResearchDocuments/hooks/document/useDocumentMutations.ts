
import { useAddDocument } from './useAddDocument';
import { useDeleteDocument } from './useDeleteDocument';
import { useUpdateDocument } from './useUpdateDocument';
import { ResearchDocument } from '../../types/documentTypes';

export const useDocumentMutations = (
  documents: ResearchDocument[],
  setDocuments: React.Dispatch<React.SetStateAction<ResearchDocument[]>>,
  bucketName: string
) => {
  const { addDocument } = useAddDocument(setDocuments);
  const { deleteDocument } = useDeleteDocument(documents, setDocuments, bucketName);
  const { updateDocumentMetadata } = useUpdateDocument(documents, setDocuments, bucketName);

  return {
    addDocument,
    deleteDocument,
    updateDocumentMetadata
  };
};
