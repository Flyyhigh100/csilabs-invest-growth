
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download, FileText } from 'lucide-react';
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';

interface DocumentViewerProps {
  document: ResearchDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, open, onOpenChange }) => {
  if (!document) return null;

  // Format the title to make it more readable
  const formattedTitle = document.title
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  // Extract YouTube video ID if this is a video document
  const getYoutubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const isVideo = document.type === 'video' && document.videoUrl;
  const youtubeEmbedUrl = isVideo ? getYoutubeEmbedUrl(document.videoUrl!) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{formattedTitle}</DialogTitle>
        </DialogHeader>
        
        {document.description && (
          <p className="text-gray-600 mb-4 text-sm">
            {document.description}
          </p>
        )}
        
        {document.authors && (
          <p className="text-xs text-gray-500 mb-4">
            <span className="font-medium">Authors:</span> {document.authors}
          </p>
        )}
        
        <div className="flex-grow h-[70vh]">
          {isVideo && youtubeEmbedUrl ? (
            <iframe
              src={youtubeEmbedUrl}
              className="w-full h-full border-0 rounded"
              title={formattedTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <iframe 
              src={document.pdfUrl} 
              className="w-full h-full border-0 rounded"
              title={formattedTitle}
            />
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          {!isVideo && (
            <>
              <Button variant="outline" onClick={() => window.open(document.pdfUrl, '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" /> Open in New Tab
              </Button>
              <Button className="bg-gradient-to-r from-cbis-blue to-cbis-teal" onClick={() => window.open(document.pdfUrl, '_blank', 'download')}>
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
            </>
          )}
          {isVideo && (
            <Button variant="outline" onClick={() => window.open(document.videoUrl, '_blank')}>
              <ExternalLink className="mr-2 h-4 w-4" /> Open on YouTube
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
