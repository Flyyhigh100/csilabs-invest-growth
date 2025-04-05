
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResearchDocument } from './types/documentTypes';
import DocumentList from './components/DocumentList';
import CodeGenerator from './components/CodeGenerator';
import DocumentEditDialog from './components/DocumentEditDialog';
import { toast } from 'sonner';

interface DocumentsListProps {
  documents: ResearchDocument[];
  isLoading: boolean;
  onReload: () => void;
  onUpdateDocument?: (docId: string, data: Partial<ResearchDocument>) => Promise<boolean>;
  onDeleteDocument?: (docId: string) => Promise<boolean>;
}

const DocumentsList: React.FC<DocumentsListProps> = ({ 
  documents, 
  isLoading, 
  onReload,
  onUpdateDocument,
  onDeleteDocument
}) => {
  const [editingDocument, setEditingDocument] = useState<ResearchDocument | null>(null);
  const [isReloading, setIsReloading] = useState(false);

  const handleEditDocument = (document: ResearchDocument) => {
    setEditingDocument(document);
  };

  const handleSaveDocument = async (docId: string, data: Partial<ResearchDocument>) => {
    if (!onUpdateDocument) return false;
    const result = await onUpdateDocument(docId, data);
    
    if (result) {
      // Force reload documents after update to ensure we're in sync with storage
      handleReload();
    }
    
    return result;
  };
  
  const handleReload = async () => {
    try {
      setIsReloading(true);
      await onReload();
      toast.success("Documents reloaded successfully");
    } catch (error) {
      console.error("Error reloading documents:", error);
      toast.error("Failed to reload documents");
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Current Research Documents</CardTitle>
          <CardDescription>
            Manage the documents that appear on the research page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentList 
            documents={documents} 
            isLoading={isLoading}
            onEditDocument={onUpdateDocument ? handleEditDocument : undefined}
            onDeleteDocument={onDeleteDocument}
          />
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button 
            onClick={handleReload} 
            variant="outline" 
            disabled={isReloading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isReloading ? 'animate-spin' : ''}`} />
            {isReloading ? 'Reloading...' : 'Reload'}
          </Button>
          <CodeGenerator documents={documents} />
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <DocumentEditDialog
        document={editingDocument}
        open={!!editingDocument}
        onOpenChange={(open) => !open && setEditingDocument(null)}
        onSave={handleSaveDocument}
      />
    </>
  );
};

export default DocumentsList;
