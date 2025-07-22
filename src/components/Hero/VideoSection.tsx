
import React from 'react';
import YouTubeEmbed from './YouTubeEmbed';

interface VideoSectionProps {
  isLoaded: boolean;
}

const VideoSection: React.FC<VideoSectionProps> = ({ isLoaded }) => {
  return (
    <div className={`grid md:grid-cols-2 gap-8 mb-12 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
      {/* Site Walkthrough Video */}
      <div className="space-y-4">
        <YouTubeEmbed
          videoId="Jmwmcouc1tA"
          title="Site Walkthrough - How to Navigate the Platform"
          className="bg-white rounded-2xl p-4 shadow-elevation"
        />
      </div>

      {/* Token Purchase Guide Video */}
      <div className="space-y-4">
        <YouTubeEmbed
          videoId="HNVc7SGH30M"
          title="Token Purchase Guide - How to Buy Tokens"
          className="bg-white rounded-2xl p-4 shadow-elevation"
        />
      </div>
    </div>
  );
};

export default VideoSection;
