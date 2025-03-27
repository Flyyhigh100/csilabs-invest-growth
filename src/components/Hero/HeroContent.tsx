
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface HeroContentProps {
  isLoaded: boolean;
}

const HeroContent: React.FC<HeroContentProps> = ({ isLoaded }) => {
  return (
    <div className={`transition-all duration-1000 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
      <div className="inline-block px-3 py-1 mb-6 text-xs font-medium tracking-wider uppercase rounded-full text-cbis-blue bg-blue-50 border border-blue-100">
        FDA-Tracked Cancer Research
      </div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight text-cbis-dark">
        <span className="bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent">Proven Results</span> in Cancer Cell Elimination
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
        CSi Labs has successfully demonstrated the elimination of cancer cells in laboratory studies. Our cannabinoid-based treatments are moving toward FDA clinical trials, backed by Harvard-validated research.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg" className="bg-gradient-to-r from-cbis-blue to-cbis-teal text-white hover:opacity-90 transition-opacity flex-shrink-0">
          <Link to="/register">
            Fund Our FDA Trials <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="border-cbis-blue text-cbis-blue hover:bg-cbis-blue/5 transition-colors flex-shrink-0">
          <Link to="/token-info">
            View Research Data
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default HeroContent;
