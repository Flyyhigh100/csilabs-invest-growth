
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResearchDocument } from './types/documentTypes';
import DocumentList from './components/DocumentList';
import CodeGenerator from './components/CodeGenerator';
import DocumentEditDialog from './components/DocumentEditDialog';

interface DocumentsListProps {
  documents: ResearchDocument[];
  isLoading: boolean;
  onReload: () => void;
  onUpdateDocument?: (docId: string, data: Partial<ResearchDocument>) => Promise<boolean>;
}

const DocumentsList: React.FC<DocumentsListProps> = ({ 
  documents, 
  isLoading, 
  onReload,
  onUpdateDocument
}) => {
  const [editingDocument, setEditingDocument] = useState<ResearchDocument | null>(null);

  const handleEditDocument = (document: ResearchDocument) => {
    setEditingDocument(document);
  };

  const handleSaveDocument = async (docId: string, data: Partial<ResearchDocument>) => {
    if (!onUpdateDocument) return false;
    return await onUpdateDocument(docId, data);
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
          />
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button onClick={onReload} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload
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
