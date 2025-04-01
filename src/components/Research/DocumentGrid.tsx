
import React from 'react';
import DocumentCard from './DocumentCard';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DocumentGridProps {
  documents: any[];
  isLoading: boolean;
  searchTerm: string;
  selectedCategory: string | null;
  onClearFilters: () => void;
}

const DocumentGrid: React.FC<DocumentGridProps> = ({ 
  documents, 
  isLoading, 
  searchTerm, 
  selectedCategory,
  onClearFilters
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="p-6 pb-2">
              <Skeleton className="h-6 w-3/4" />
            </div>
            <div className="p-6 pt-0">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="p-6 pt-0">
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <FileQuestion className="h-16 w-16 text-gray-400 dark:text-gray-600" />
          {searchTerm || selectedCategory ? (
            <>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">No Matching Documents</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria.
              </p>
              <Button 
                variant="outline" 
                onClick={onClearFilters}
              >
                Clear Filters
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">No Research Documents Available</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Our team is working on new research materials. Please check back soon.
              </p>
            </>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
};

export default DocumentGrid;
