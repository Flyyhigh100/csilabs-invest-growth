
import React from 'react';

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  className?: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoId, title, className = "" }) => {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative w-full h-0 pb-[56.25%] overflow-hidden rounded-lg shadow-md">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
          loading="lazy"
        />
      </div>
      <h3 className="mt-3 text-sm font-medium text-gray-800 text-center">{title}</h3>
    </div>
  );
};

export default YouTubeEmbed;
