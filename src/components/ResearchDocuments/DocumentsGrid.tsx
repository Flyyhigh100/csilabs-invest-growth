
import React from 'react';
import { FileText, Loader2 } from 'lucide-react';
import DocumentCard from './DocumentCard';
import FadeInSection from '@/components/FadeInSection';
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface DocumentsGridProps {
  documents: ResearchDocument[];
  isLoading: boolean;
  onSelectDocument: (document: ResearchDocument) => void;
  onRefresh?: () => void;
}

const DocumentsGrid: React.FC<DocumentsGridProps> = ({ 
  documents, 
  isLoading, 
  onSelectDocument,
  onRefresh
}) => {
  // If we have documents, show them even if still loading more
  if (documents.length > 0) {
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
        
        {/* Show subtle loading indicator if refreshing */}
        {isLoading && (
          <div className="fixed bottom-4 right-4 bg-white p-2 rounded-full shadow-md">
            <Loader2 className="h-5 w-5 animate-spin text-cbis-blue" />
          </div>
        )}
      </div>
    );
  }

  // If truly empty and still loading
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-[320px]">
            <Skeleton className="h-full w-full" />
          </div>
        ))}
      </div>
    );
  }

  // If no documents and not loading
  return (
    <div className="col-span-full text-center py-10">
      <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
      <h3 className="text-xl font-medium text-gray-700">No documents found</h3>
      <p className="text-gray-500 mt-2">There are no research documents in this category.</p>
      {onRefresh && (
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={onRefresh}
        >
          Refresh Documents
        </Button>
      )}
    </div>
  );
};

export default DocumentsGrid;
