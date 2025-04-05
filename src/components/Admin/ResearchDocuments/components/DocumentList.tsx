
import React, { useState } from 'react';
import { RefreshCw, FileText } from 'lucide-react';
import DocumentCard from './DocumentCard';
import { ResearchDocument } from '../types/documentTypes';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface DocumentListProps {
  documents: ResearchDocument[];
  isLoading: boolean;
  onEditDocument?: (document: ResearchDocument) => void;
  onDeleteDocument?: (documentId: string) => Promise<boolean>;
}

const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, 
  isLoading, 
  onEditDocument,
  onDeleteDocument
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (documentId: string) => {
    setDocumentToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete || !onDeleteDocument) return;
    
    setIsDeleting(true);
    const success = await onDeleteDocument(documentToDelete);
    setIsDeleting(false);
    
    if (success) {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

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
    <>
      <div className="space-y-4">
        {documents.map((doc) => (
          <DocumentCard 
            key={doc.id} 
            document={doc}
            onEdit={onEditDocument}
            onDelete={onDeleteDocument ? (id) => handleDeleteClick(id) : undefined}
          />
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The document will be permanently removed from the research page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DocumentList;
