import React from 'react';
import journeyImg from '@/assets/hero/journey-timeline.png';

const JourneyTimelinePanel: React.FC = () => (
  <div className="w-full rounded-2xl overflow-hidden shadow-elevation border border-amber-500/30 bg-black">
    <img
      src={journeyImg}
      alt="About Our Journey — 1-Million Strong Killing Cancers timeline 2008–2018, Harvard Award Winning successes"
      className="w-full h-auto block"
      loading="lazy"
    />
  </div>
);

export default JourneyTimelinePanel;
