
import React from 'react';
import { ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';

interface DocumentTableRowProps {
  document: {
    id: string;
    name: string;
    displayName: string;
    created_at: string;
    size: number;
    url: string;
  };
}

const DocumentTableRow: React.FC<DocumentTableRowProps> = ({ document }) => {
  const categoryMatch = document.displayName.match(/^([^-]+)/);
  const category = categoryMatch ? categoryMatch[0].trim() : "Research";
  
  return (
    <TableRow key={document.id}>
      <TableCell className="font-medium">{document.displayName}</TableCell>
      <TableCell>
        <Badge variant="outline">
          {category}
        </Badge>
      </TableCell>
      <TableCell>{new Date(document.created_at).toLocaleDateString()}</TableCell>
      <TableCell>{(document.size / 1024 / 1024).toFixed(2)} MB</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm"
            asChild
          >
            <a href={document.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              View
            </a>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            asChild
          >
            <a href={document.url} download={document.displayName + ".pdf"}>
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default DocumentTableRow;
