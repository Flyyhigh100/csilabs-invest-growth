
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';

interface DocumentCardProps {
  document: ResearchDocument;
  onSelect: (document: ResearchDocument) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onSelect }) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow border border-gray-100">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="bg-blue-50 text-cbis-blue text-xs font-medium px-2.5 py-1 rounded">
            {document.category}
          </div>
          <span className="text-xs text-gray-500">{document.publishDate}</span>
        </div>
        <CardTitle className="mt-3 text-xl leading-tight">{document.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col pt-2">
        <p className="text-gray-600 mb-6 text-sm flex-grow line-clamp-3">
          {document.description}
        </p>
        {document.authors && (
          <p className="text-xs text-gray-500 mb-4">
            <span className="font-medium">Authors:</span> {document.authors}
          </p>
        )}
        <Button 
          variant="default" 
          className="w-full mt-auto bg-gradient-to-r from-cbis-blue to-cbis-teal text-white hover:opacity-90"
          onClick={() => onSelect(document)}
        >
          <FileText className="mr-2 h-4 w-4" /> View Document
        </Button>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
