
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResearchDocument } from './types/documentTypes';
import DocumentList from './components/DocumentList';
import CodeGenerator from './components/CodeGenerator';

interface DocumentsListProps {
  documents: ResearchDocument[];
  isLoading: boolean;
  onReload: () => void;
}

const DocumentsList: React.FC<DocumentsListProps> = ({ documents, isLoading, onReload }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Research Documents</CardTitle>
        <CardDescription>
          Manage the documents that appear on the research page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DocumentList documents={documents} isLoading={isLoading} />
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button onClick={onReload} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reload
        </Button>
        <CodeGenerator documents={documents} />
      </CardFooter>
    </Card>
  );
};

export default DocumentsList;
