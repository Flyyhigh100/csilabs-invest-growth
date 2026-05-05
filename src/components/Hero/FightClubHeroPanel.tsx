import React from 'react';
import { Link } from 'react-router-dom';

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

    </div>
  );
};

export default FightClubHeroPanel;
