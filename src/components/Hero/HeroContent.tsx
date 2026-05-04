
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface HeroContentProps {
  isLoaded: boolean;
}

const HeroContent: React.FC<HeroContentProps> = ({
  isLoaded
}) => {
  return <div className="flex flex-col justify-center h-full">
      <div className="inline-block px-3 py-1 mb-6 text-xs font-medium tracking-wider uppercase rounded-full text-cbis-blue bg-blue-50 border border-blue-100">
        Affordable Cancer Treatment
      </div>
      <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight lg:text-6xl text-destructive">
        <span className="bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent">Harvard Award Winning,</span> Low-Cost Cancer-Killing Treatments
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg font-normal">
        The 1-Million Strong Killing Cancers Foundation, the 1-Million Strong Fight Club, & CSi Labs are making cancer treatments affordable and accessible for millions of patients through our innovative cancer killing fundraising meme token. Our Low-Cost, Harvard Award Winning cannabinoid-based treatments eliminate cancer cells without the harsh side effects of chemical therapies.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <Link
          to="/register"
          className="flex-shrink-0 inline-flex flex-col items-center justify-center rounded-lg bg-gradient-to-r from-cbis-blue to-cbis-teal text-white px-6 py-3 shadow-elevation hover:opacity-90 transition-opacity"
        >
          <span className="flex items-center text-xl md:text-2xl font-extrabold tracking-wide">
            JOIN NOW <ArrowRight className="ml-2 h-5 w-5" />
          </span>
          <span className="text-xs md:text-sm font-light italic mt-0.5 opacity-90">
            Do your Part … to Keep Killing Cancers …
          </span>
        </Link>
        <Button asChild variant="outline" size="lg" className="border-cbis-blue text-cbis-blue hover:bg-cbis-blue/5 transition-colors flex-shrink-0">
          <Link to="/research-documents" className="mx-0 px-[6px]">
            View Research Documents
          </Link>
        </Button>
      </div>
    </div>;
};

export default HeroContent;
