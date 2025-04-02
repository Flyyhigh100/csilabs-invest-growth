
import React, { useState, useEffect } from 'react';
import { KycVerificationWithProfile } from '../../types';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DocumentSection from './components/DocumentSection';
import DebugInfo from './components/DebugInfo';
import { getKycDocumentUrl, verifyImageUrl } from '@/utils/admin/kyc/documents';

interface KycDocumentsTabProps {
  kyc: KycVerificationWithProfile;
}

const KycDocumentsTab: React.FC<KycDocumentsTabProps> = ({ kyc }) => {
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Process URLs when the component mounts or when kyc changes
  const [processedUrls, setProcessedUrls] = useState({
    idFront: null as string | null,
    idBack: null as string | null,
    selfie: null as string | null,
    loading: true,
    error: null as string | null
  });
  
  useEffect(() => {
    const processUrls = async () => {
      try {
        console.log('Starting URL processing for KYC documents:', {
          id_front_url: kyc.id_front_url,
          id_back_url: kyc.id_back_url,
          selfie_url: kyc.selfie_url
        });
        
        // Check if URLs are present
        if (!kyc.id_front_url && !kyc.id_back_url && !kyc.selfie_url) {
          console.log('No document URLs found in KYC record');
          setProcessedUrls({
            idFront: null,
            idBack: null,
            selfie: null,
            loading: false,
            error: 'No document URLs found in KYC record'
          });
          return;
        }
        
        // Create direct access URLs using signed URLs for better security
        try {
          const [idFrontUrl, idBackUrl, selfieUrl] = await Promise.all([
            kyc.id_front_url ? getKycDocumentUrl(kyc.id_front_url) : null,
            kyc.id_back_url ? getKycDocumentUrl(kyc.id_back_url) : null,
            kyc.selfie_url ? getKycDocumentUrl(kyc.selfie_url) : null
          ]);
          
          console.log('Generated document URLs:', { 
            idFrontUrl, 
            idBackUrl, 
            selfieUrl 
          });
          
          setProcessedUrls({
            idFront: idFrontUrl,
            idBack: idBackUrl,
            selfie: selfieUrl,
            loading: false,
            error: null
          });
          
        } catch (urlError) {
          console.error('Error generating document URLs:', urlError);
          
          // Fallback to direct URLs (less secure but useful for debugging)
          setProcessedUrls({
            idFront: verifyImageUrl(kyc.id_front_url),
            idBack: verifyImageUrl(kyc.id_back_url),
            selfie: verifyImageUrl(kyc.selfie_url),
            loading: false,
            error: `Error generating secure URLs: ${urlError.message}`
          });
          
          toast.error('Failed to generate secure document URLs, using direct access instead');
        }
      } catch (error) {
        console.error('Error processing document URLs:', error);
        setProcessedUrls({
          idFront: null,
          idBack: null,
          selfie: null,
          loading: false,
          error: `Error processing URLs: ${error.message}`
        });
        toast.error('Error loading document URLs');
      }
    };
    
    setProcessedUrls(prev => ({ ...prev, loading: true, error: null }));
    processUrls();
  }, [kyc.id_front_url, kyc.id_back_url, kyc.selfie_url]);
  
  const openFullImage = (url: string) => {
    setFullImageUrl(url);
    window.open(url, '_blank', 'noopener,noreferrer');
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

  // Loading state
  if (processedUrls.loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
          <p className="text-sm text-gray-500">Loading document URLs...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (processedUrls.error && !processedUrls.idFront && !processedUrls.idBack && !processedUrls.selfie) {
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
          <h3 className="font-medium mb-2">Failed to load documents</h3>
          <p className="text-sm">{processedUrls.error}</p>
          <div className="mt-4 p-3 bg-white/50 rounded border border-amber-100 text-xs font-mono overflow-auto max-h-40">
            <p className="mb-1 font-semibold">Document URLs in database:</p>
            <p>ID Front: {kyc.id_front_url || 'Not provided'}</p>
            <p>ID Back: {kyc.id_back_url || 'Not provided'}</p>
            <p>Selfie: {kyc.selfie_url || 'Not provided'}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DocumentSection 
          title="ID Front" 
          imageUrl={processedUrls.idFront}
          onOpenFullImage={openFullImage}
          onZoomImage={openZoomModal}
        />
        
        <DocumentSection 
          title="ID Back" 
          imageUrl={processedUrls.idBack}
          onOpenFullImage={openFullImage}
          onZoomImage={openZoomModal}
        />
        
        <DocumentSection 
          title="Selfie with ID" 
          imageUrl={processedUrls.selfie}
          onOpenFullImage={openFullImage}
          onZoomImage={openZoomModal}
        />
      </div>
      
      {processedUrls.error && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
          <p className="font-medium">Warning: {processedUrls.error}</p>
          <p className="text-xs mt-1">Documents are displayed using direct URLs as a fallback.</p>
        </div>
      )}
      
      <DebugInfo kyc={kyc} processedUrls={processedUrls} />
      
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
