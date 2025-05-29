
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ResearchDocument } from '../types/documentTypes';
import DocumentEditForm from './DocumentEditForm';
import { toast } from 'sonner';

interface DocumentEditDialogProps {
  document: ResearchDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (docId: string, data: Partial<ResearchDocument>) => Promise<boolean>;
}

const DocumentEditDialog: React.FC<DocumentEditDialogProps> = ({ 
  document, 
  open,
  onOpenChange,
  onSave 
}) => {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async (data: Partial<ResearchDocument>) => {
    if (!document) return;
    
    setIsSaving(true);
    console.log("DocumentEditDialog: Submitting form with data:", data);
    
    try {
      // Ensure all required fields are present and properly formatted
      const updatedData = {
        title: data.title || document.title,
        description: data.description || document.description,
        category: data.category || document.category,
        publishDate: data.publishDate || document.publishDate,
        authors: data.authors || document.authors || ''
      };
      
      console.log("DocumentEditDialog: Final data being sent to save:", updatedData);
      const success = await onSave(document.id, updatedData);
      
      if (success) {
        console.log("DocumentEditDialog: Save successful");
        toast.success("Document updated successfully");
        onOpenChange(false);
      } else {
        console.error("DocumentEditDialog: Save failed");
        toast.error("Failed to update document");
      }
    } catch (error) {
      console.error("DocumentEditDialog: Error saving document:", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Document Metadata</DialogTitle>
          <DialogDescription>
            Update the document information below. Changes will be saved to the database.
          </DialogDescription>
        </DialogHeader>
        <DocumentEditForm
          document={document}
          isSaving={isSaving}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DocumentEditDialog;
