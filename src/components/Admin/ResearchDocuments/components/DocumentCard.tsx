
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Pencil, Trash2 } from 'lucide-react';
import { ResearchDocument } from '../types/documentTypes';

interface DocumentCardProps {
  document: ResearchDocument;
  onEdit?: (document: ResearchDocument) => void;
  onDelete?: (documentId: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onEdit, onDelete }) => {
  return (
    <Card key={document.id} className="bg-gray-50">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-medium">{document.title}</h3>
            <p className="text-sm text-gray-500">{document.category}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open(document.pdfUrl, '_blank')}
              title="View document"
            >
              <FileText className="h-4 w-4" />
            </Button>
            
            {onEdit && (
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => onEdit(document)}
                title="Edit metadata"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}

            {onDelete && (
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => onDelete(document.id)}
                title="Delete document"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
