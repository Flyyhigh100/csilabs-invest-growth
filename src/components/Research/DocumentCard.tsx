
import React from 'react';
import { FileText, Calendar, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DocumentCardProps {
  document: {
    id: string;
    name: string;
    displayName: string;
    created_at: string;
    size: number;
    url: string;
  };
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const categoryMatch = document.displayName.match(/^([^-]+)/);
  const category = categoryMatch ? categoryMatch[0].trim() : "Research";
  
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow border-2 hover:border-primary/20">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-2 text-lg" title={document.displayName}>
            {document.displayName}
          </CardTitle>
          <Badge variant="outline" className="ml-2 flex-shrink-0">
            {category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="py-4 flex-grow">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Published: {new Date(document.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <FileText className="h-4 w-4 mr-1" />
          <span>PDF • {(document.size / 1024 / 1024).toFixed(2)} MB</span>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-gray-50 dark:bg-gray-800/50 p-4">
        <div className="flex gap-2 w-full">
          <Button className="w-full flex items-center gap-2" asChild>
            <a href={document.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              View Document
            </a>
          </Button>
          <Button variant="outline" className="flex items-center gap-1" asChild>
            <a href={document.url} download={document.displayName + ".pdf"}>
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DocumentCard;
