
import React, { useState } from 'react';
import { Play, AlertCircle } from 'lucide-react';

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  className?: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoId, title, className = "" }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  if (hasError) {
    return (
      <div className={`relative w-full ${className}`}>
        <div className="relative w-full h-0 pb-[56.25%] overflow-hidden rounded-lg shadow-md bg-gray-100 flex items-center justify-center">
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-600 mb-3">Video temporarily unavailable</p>
            <a 
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Play className="h-4 w-4" />
              Watch on YouTube
            </a>
          </div>
        </div>
        <h3 className="mt-3 text-sm font-medium text-gray-800 text-center">{title}</h3>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative w-full h-0 pb-[56.25%] overflow-hidden rounded-lg shadow-md">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute top-0 left-0 w-full h-full"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>
      <h3 className="mt-3 text-sm font-medium text-gray-800 text-center">{title}</h3>
    </div>
  );
};

export default YouTubeEmbed;
