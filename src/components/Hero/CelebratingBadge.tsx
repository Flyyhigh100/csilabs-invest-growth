import React from 'react';
import { Link } from 'react-router-dom';
import badgeImg from '@/assets/hero/celebrating-badge.png';

const CelebratingBadge: React.FC = () => (
  <Link
    to="/register"
    aria-label="Join the 1-Million Strong Killing Cancers Foundation"
    className="block w-full rounded-2xl overflow-hidden shadow-elevation border border-amber-500/30 hover:shadow-lg hover:scale-[1.005] transition-all duration-300"
  >
    <img
      src={badgeImg}
      alt="Celebrating 1-Million Strong Killing Cancers Foundation — Congratulations New Fight Club Members"
      className="w-full h-auto block"
      loading="lazy"
    />
  </Link>
);

export default CelebratingBadge;
