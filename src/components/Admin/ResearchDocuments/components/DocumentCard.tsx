
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Pencil, Trash2, AlertCircle, Loader } from 'lucide-react';
import { ResearchDocument } from '../types/documentTypes';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DocumentCardProps {
  document: ResearchDocument;
  onEdit?: () => void;
  onDelete?: () => Promise<boolean>;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onEdit, onDelete }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await onDelete();
      if (success) {
        setDeleteDialogOpen(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-2">
            <div className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded">
              {document.category}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => window.open(document.pdfUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Open document</span>
            </Button>
          </div>
          <CardTitle className="line-clamp-2 text-base">{document.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow pb-1">
          <p className="text-sm text-gray-500 line-clamp-2 mb-2">{document.description}</p>
          <div className="text-xs text-gray-400 space-y-1">
            {document.authors && (
              <p><span className="font-medium">Authors:</span> {document.authors}</p>
            )}
            <p><span className="font-medium">Published:</span> {document.publishDate}</p>
          </div>
        </CardContent>
        <CardFooter className="pt-4 border-t">
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => window.open(document.pdfUrl, '_blank')}
            >
              <FileText className="h-3 w-3 mr-1" /> View
            </Button>
            
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={onEdit}
                >
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Button>
              )}
              
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Delete Document
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{document.title}" and remove the file from storage. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Document"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DocumentCard;
