
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download } from 'lucide-react';
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';

interface DocumentViewerProps {
  document: ResearchDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, open, onOpenChange }) => {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{document.title}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow h-[70vh]">
          <iframe 
            src={document.pdfUrl} 
            className="w-full h-full border-0 rounded"
            title={document.title}
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => window.open(document.pdfUrl, '_blank')}>
            <ExternalLink className="mr-2 h-4 w-4" /> Open in New Tab
          </Button>
          <Button className="bg-gradient-to-r from-cbis-blue to-cbis-teal" onClick={() => window.open(document.pdfUrl, '_blank')}>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
