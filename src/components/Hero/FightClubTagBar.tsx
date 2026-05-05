import React from 'react';
import tagImg from '@/assets/hero/fight-club-tag.png';

const FightClubTagBar: React.FC = () => (
  <div className="w-full rounded-xl overflow-hidden shadow-elevation border border-amber-500/30">
    <img
      src={tagImg}
      alt="1-Million STRONG | Digital HUB — Killing Cancer Fight Club"
      className="w-full h-auto block"
      loading="lazy"
    />
  </div>
);

export default FightClubTagBar;
