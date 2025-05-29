
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download, FileText, ZoomIn, ZoomOut, Maximize, ChevronUp, ChevronDown } from 'lucide-react';
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';
import { useIsMobile } from '@/hooks/use-mobile';

interface DocumentViewerProps {
  document: ResearchDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, open, onOpenChange }) => {
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  
  // Reset states when opening a new document
  useEffect(() => {
    if (open) {
      setIsDescriptionCollapsed(isMobile); // Auto-collapse on mobile
      setZoomLevel(1);
      setIsFullscreen(false);
    }
  }, [open, document, isMobile]);
  
  if (!document) return null;

  // Check if the document is an external URL (not a PDF)
  const isExternalUrl = document.pdfUrl && !document.pdfUrl.includes('.pdf') && (
    document.pdfUrl.startsWith('http://') || 
    document.pdfUrl.startsWith('https://')
  );

  // Format the title to make it more readable
  const formattedTitle = document.title
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };
  
  // Add preset zoom levels for convenience
  const handleZoomPreset = (level: number) => {
    setZoomLevel(level);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const toggleDescription = () => {
    setIsDescriptionCollapsed(prev => !prev);
  };

  const handleDownload = () => {
    window.open(document.pdfUrl, '_blank', 'download');
  };

  const handleOpenExternal = () => {
    if (isExternalUrl) {
      // For external URLs, open directly
      window.open(document.pdfUrl, '_blank');
    } else {
      // Use the new proxy URL for professional-looking links
      const proxyUrl = `https://hrhvliqkmetcdphnetxb.supabase.co/functions/v1/document-proxy?id=${document.id}`;
      console.log('Opening document with proxy URL:', proxyUrl);
      console.log('Document ID:', document.id);
      window.open(proxyUrl, '_blank');
    }
  };

  // If it's an external URL, show a simplified interface
  if (isExternalUrl) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-xl">{formattedTitle}</DialogTitle>
          </DialogHeader>
          
          {document.description && (
            <div className="mb-6">
              <p className="text-gray-600 mb-2 text-sm">
                {document.description}
              </p>
              
              {document.authors && (
                <p className="text-xs text-gray-500 mb-2">
                  <span className="font-medium">Authors:</span> {document.authors}
                </p>
              )}
            </div>
          )}
          
          <div className="text-center py-4">
            <Button 
              onClick={handleOpenExternal}
              className="bg-gradient-to-r from-cbis-blue to-cbis-teal text-white px-8 py-3 text-lg"
              size="lg"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              View Document
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Dynamically calculate the PDF viewer height
  const pdfViewerHeight = isFullscreen 
    ? '90vh' 
    : (isDescriptionCollapsed || !document.description) 
      ? '78vh' 
      : '60vh';

  // Determine dialog size based on fullscreen state
  const dialogSizeClass = isFullscreen 
    ? "max-w-[95vw] w-[95vw] max-h-[95vh] p-2"
    : "max-w-4xl w-[90vw] max-h-[90vh]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${dialogSizeClass} flex flex-col`}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl">{formattedTitle}</DialogTitle>
        </DialogHeader>
        
        {document.description && (
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <button 
                onClick={toggleDescription}
                className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-1"
              >
                {isDescriptionCollapsed ? (
                  <><ChevronDown className="h-4 w-4 mr-1" /> Show description</>
                ) : (
                  <><ChevronUp className="h-4 w-4 mr-1" /> Hide description</>
                )}
              </button>
            </div>
            
            {!isDescriptionCollapsed && (
              <>
                <p className="text-gray-600 mb-2 text-sm">
                  {document.description}
                </p>
                
                {document.authors && (
                  <p className="text-xs text-gray-500 mb-2">
                    <span className="font-medium">Authors:</span> {document.authors}
                  </p>
                )}
              </>
            )}
          </div>
        )}
        
        <div className="relative flex-grow" style={{ height: pdfViewerHeight }}>
          <div className="absolute inset-0">
            <iframe 
              src={document.pdfUrl} 
              className="w-full h-full border-0 rounded"
              title={formattedTitle}
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
            />
          </div>
          
          {/* Mobile floating controls */}
          {isMobile && (
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              <div className="bg-white shadow-lg rounded-full p-2 flex flex-col gap-2">
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={handleZoomIn} 
                  className="rounded-full h-9 w-9"
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={handleZoomOut} 
                  className="rounded-full h-9 w-9"
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={toggleFullscreen} 
                  className="rounded-full h-9 w-9"
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Improved bottom controls layout */}
        <div className="flex flex-col gap-3 mt-4">
          {/* Zoom controls for non-mobile */}
          {!isMobile && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="mr-1 h-4 w-4" /> Zoom Out
              </Button>
              
              {/* Preset zoom buttons */}
              <div className="flex gap-1">
                <Button 
                  variant={zoomLevel === 0.75 ? "default" : "outline"}
                  size="sm" 
                  className="px-2 py-1 text-xs h-8"
                  onClick={() => handleZoomPreset(0.75)}
                >
                  75%
                </Button>
                <Button 
                  variant={zoomLevel === 1 ? "default" : "outline"}
                  size="sm" 
                  className="px-2 py-1 text-xs h-8"
                  onClick={() => handleZoomPreset(1)}
                >
                  100%
                </Button>
                <Button 
                  variant={zoomLevel === 1.5 ? "default" : "outline"}
                  size="sm" 
                  className="px-2 py-1 text-xs h-8"
                  onClick={() => handleZoomPreset(1.5)}
                >
                  150%
                </Button>
              </div>
              
              <span className="text-sm mx-1">{Math.round(zoomLevel * 100)}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="mr-1 h-4 w-4" /> Zoom In
              </Button>
              <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                <Maximize className="mr-1 h-4 w-4" /> {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </Button>
            </div>
          )}
          
          {/* Action buttons - Always centered and properly spaced */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="outline" onClick={handleOpenExternal}>
              <ExternalLink className="mr-2 h-4 w-4" /> 
              {isMobile ? 'Open' : 'Open in New Tab'}
            </Button>
            {!isExternalUrl && (
              <Button className="bg-gradient-to-r from-cbis-blue to-cbis-teal" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> 
                {isMobile ? 'Download' : 'Download'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
