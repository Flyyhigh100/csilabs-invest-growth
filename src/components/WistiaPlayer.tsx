
import React, { useEffect, useRef } from 'react';

interface WistiaPlayerProps {
  mediaId: string;
  aspect?: string;
  className?: string;
}

const WistiaPlayer: React.FC<WistiaPlayerProps> = ({ 
  mediaId, 
  aspect = "1.7777777777777777", 
  className = "" 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if Wistia is available
    if (typeof window !== 'undefined' && window.Wistia) {
      console.log('Wistia is available, initializing player for media:', mediaId);
      
      // Initialize Wistia player
      window.Wistia.embed(mediaId, {
        container: containerRef.current,
        aspectRatio: aspect
      });
    } else {
      console.log('Wistia not yet available, will retry...');
      
      // Retry after a short delay
      const retryTimeout = setTimeout(() => {
        if (window.Wistia && containerRef.current) {
          console.log('Wistia now available, initializing player for media:', mediaId);
          window.Wistia.embed(mediaId, {
            container: containerRef.current,
            aspectRatio: aspect
          });
        } else {
          console.warn('Wistia still not available after retry');
        }
      }, 1000);

      return () => clearTimeout(retryTimeout);
    }
  }, [mediaId, aspect]);

  // Fallback to web component approach
  return (
    <div className={className}>
      <div ref={containerRef} className="w-full h-full">
        <wistia-player media-id={mediaId} aspect={aspect}></wistia-player>
      </div>
    </div>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Wistia?: {
      embed: (mediaId: string, options: any) => void;
    };
  }
}

export default WistiaPlayer;
