
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import JoinNowImageButton from './JoinNowImageButton';
import FightClubTagBar from './FightClubTagBar';

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
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight leading-tight text-cbis-blue">
        Harvard Award Winning, Low-Cost Cancer-Killing Treatments
      </h1>
      <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed max-w-lg font-normal">
        The 1-Million Strong Killing Cancers Foundation, the 1-Million Strong Fight Club, & CSi Labs are making cancer treatments affordable and accessible for millions of patients through our innovative cancer killing fundraising meme token. Our Low-Cost, Harvard Award Winning cannabinoid-based treatments eliminate cancer cells without the harsh side effects of chemical therapies.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center mb-6">
        <JoinNowImageButton className="flex-shrink-0 w-full sm:w-auto sm:max-w-[260px]" />
        <Button asChild variant="outline" size="lg" className="border-cbis-blue text-cbis-blue hover:bg-cbis-blue/5 transition-colors flex-shrink-0">
          <Link to="/research-documents" className="mx-0 px-[6px]">
            View Research Documents
          </Link>
        </Button>
      </div>
      <div className="max-w-md">
        <FightClubTagBar />
      </div>
    </div>;
};

export default HeroContent;
