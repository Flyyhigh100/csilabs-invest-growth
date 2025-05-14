
import React from 'react';
import { ResearchDocument } from '../types/documentTypes';
import DocumentCard from './DocumentCard';
import { Pencil, Loader2 } from 'lucide-react';

interface DocumentListProps {
  documents: ResearchDocument[];
  isLoading: boolean;
  onEditDocument?: (document: ResearchDocument) => void;
  onDeleteDocument?: (docId: string) => Promise<boolean>;
}

const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, 
  isLoading,
  onEditDocument,
  onDeleteDocument
}) => {
  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500 font-medium">Loading documents...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed rounded-md">
        <div className="flex justify-center">
          <Pencil className="h-12 w-12 text-gray-300" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No documents yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Upload your first document using the form above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          onEdit={onEditDocument ? () => onEditDocument(document) : undefined}
          onDelete={onDeleteDocument ? () => onDeleteDocument(document.id) : undefined}
        />
      ))}
    </div>
  );
};

export default DocumentList;
