
import React from 'react';
import { RefreshCw, FileText } from 'lucide-react';
import DocumentCard from './DocumentCard';
import { ResearchDocument } from '../types/documentTypes';

interface DocumentListProps {
  documents: ResearchDocument[];
  isLoading: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
        <p className="mt-2 text-gray-500">Loading documents...</p>
      </div>
    );
  }
  
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
        <p>No research documents found</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
};

export default DocumentList;
