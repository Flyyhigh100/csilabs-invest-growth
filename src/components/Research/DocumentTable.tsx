
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import DocumentTableRow from './DocumentTableRow';
import { Card, CardContent } from '@/components/ui/card';

interface DocumentTableProps {
  documents: any[];
}

const DocumentTable: React.FC<DocumentTableProps> = ({ documents }) => {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <DocumentTableRow key={doc.id} document={doc} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DocumentTable;
