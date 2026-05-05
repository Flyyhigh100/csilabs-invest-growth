import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import heroImg from '@/assets/hero/fight-club-hero.png';

const FightClubHeroPanel: React.FC = () => {
  return (
    <div className="w-full">
      <Link
        to="/register"
        aria-label="Join the 1-Million Strong Killing Cancer Fight Club"
        className="block w-full rounded-2xl overflow-hidden shadow-elevation border border-amber-500/30 hover:shadow-lg hover:scale-[1.005] transition-all duration-300"
      >
        <img
          src={heroImg}
          alt="1-Million Strong Killing Cancer Fight Club — Harvard Award Winning Cancer Treatments"
          className="w-full h-auto object-contain block"
        />
      </Link>

      <div className="mt-4">
        <Link
          to="/register"
          className="rounded-xl bg-gradient-to-r from-cbis-blue to-cbis-teal text-white p-4 flex flex-col items-center justify-center text-center shadow-elevation hover:opacity-90 transition-opacity"
        >
          <span className="flex items-center text-xl md:text-2xl font-extrabold tracking-wide">
            JOIN NOW <ArrowRight className="ml-2 h-5 w-5" />
          </span>
          <span className="text-xs md:text-sm font-light italic mt-0.5 opacity-95">
            Do your Part … to Keep Killing Cancers …
          </span>
        </Link>
      </div>
    </div>
  );
};

export default FightClubHeroPanel;
