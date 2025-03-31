
import React, { useState } from 'react';
import { KycVerificationWithProfile } from '../../types';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DocumentSection from './components/DocumentSection';
import DebugInfo from './components/DebugInfo';

interface KycDocumentsTabProps {
  kyc: KycVerificationWithProfile;
}

const KycDocumentsTab: React.FC<KycDocumentsTabProps> = ({ kyc }) => {
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const openFullImage = (url: string) => {
    setFullImageUrl(url);
    window.open(url, '_blank');
    toast.info('Opening full-size image in new tab');
  };
  
  const openZoomModal = (url: string) => {
    setZoomImageUrl(url);
    setZoomLevel(1); // Reset zoom level when opening new image
  };
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };
  
  const handleDownloadImage = () => {
    if (zoomImageUrl) {
      const link = document.createElement('a');
      link.href = zoomImageUrl;
      link.download = `kyc-document-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Document download started');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DocumentSection 
          title="ID Front" 
          imageUrl={kyc.id_front_url} 
          onOpenFullImage={openFullImage}
          onZoomImage={openZoomModal}
        />
        
        <DocumentSection 
          title="ID Back" 
          imageUrl={kyc.id_back_url} 
          onOpenFullImage={openFullImage}
          onZoomImage={openZoomModal}
        />
        
        <DocumentSection 
          title="Selfie with ID" 
          imageUrl={kyc.selfie_url} 
          onOpenFullImage={openFullImage}
          onZoomImage={openZoomModal}
        />
      </div>
      
      <DebugInfo kyc={kyc} />
      
      {/* Image Zoom Modal */}
      <Dialog open={!!zoomImageUrl} onOpenChange={(open) => !open && setZoomImageUrl(null)}>
        <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] p-1 bg-gray-900">
          <div className="relative">
            <DialogClose className="absolute right-2 top-2 z-10 bg-white/90 p-1 rounded-full">
              <X className="h-4 w-4" />
            </DialogClose>
            
            <div className="absolute left-2 top-2 z-10 flex space-x-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white/90 hover:bg-white"
                onClick={handleZoomIn}
              >
                <ZoomIn className="h-4 w-4 mr-1" />
                Zoom In
              </Button>
              
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white/90 hover:bg-white"
                onClick={handleZoomOut}
              >
                <ZoomOut className="h-4 w-4 mr-1" />
                Zoom Out
              </Button>
              
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white/90 hover:bg-white"
                onClick={handleDownloadImage}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
            
            <div className="overflow-auto h-[80vh] w-full flex items-center justify-center">
              {zoomImageUrl && (
                <img 
                  src={zoomImageUrl} 
                  alt="Zoomed KYC Document" 
                  className="transform origin-center transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KycDocumentsTab;
