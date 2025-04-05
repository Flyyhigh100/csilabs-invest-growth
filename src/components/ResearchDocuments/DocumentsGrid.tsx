
import React from 'react';
import { FileText, Loader2 } from 'lucide-react';
import DocumentCard from './DocumentCard';
import FadeInSection from '@/components/FadeInSection';
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';

interface DocumentsGridProps {
  documents: ResearchDocument[];
  isLoading: boolean;
  onSelectDocument: (document: ResearchDocument) => void;
}

const DocumentsGrid: React.FC<DocumentsGridProps> = ({ 
  documents, 
  isLoading, 
  onSelectDocument 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-cbis-blue" />
        <p className="ml-2 text-gray-600">Loading research documents...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="col-span-full text-center py-10">
        <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-medium text-gray-700">No documents found</h3>
        <p className="text-gray-500 mt-2">There are no research documents in this category.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {documents.map((document) => (
        <FadeInSection key={document.id} className="h-full">
          <DocumentCard 
            document={document} 
            onSelect={onSelectDocument}
          />
        </FadeInSection>
      ))}
    </div>
  );
};

export default DocumentsGrid;
