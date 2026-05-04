import React from 'react';

const FightClubBanner: React.FC = () => {
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-elevation border border-amber-500/30">
      {/* Top dark row */}
      <div className="bg-gradient-to-r from-cbis-dark to-black px-4 py-3 md:py-4 flex items-center justify-center gap-3 md:gap-5">
        <span className="font-serif text-xl md:text-3xl font-bold tracking-wide bg-gradient-to-b from-amber-300 to-amber-500 bg-clip-text text-transparent">
          1-Million STRONG
        </span>
        <span className="h-6 md:h-8 w-px bg-amber-400/60" />
        <span className="text-white font-extrabold text-lg md:text-2xl tracking-wide">
          Digital <span className="text-amber-400">HUB</span>
        </span>
      </div>

      {/* Gold ribbon */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 px-4 py-3 md:py-4 flex items-center justify-center">
        <h2 className="text-center font-extrabold tracking-wide text-lg md:text-3xl">
          <span className="text-cbis-dark">KILLING CANCER</span>
          <span className="text-white ml-2 md:ml-3">FIGHT CLUB</span>
        </h2>
      </div>
    </div>
  );
};

export default FightClubBanner;
