import React from 'react';
import { Link } from 'react-router-dom';
import joinImg from '@/assets/hero/join-now-button.png';

const JoinNowImageButton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Link
    to="/register"
    aria-label="Join Now — Do your part to keep killing cancers"
    className={`block rounded-lg overflow-hidden shadow-elevation hover:opacity-90 hover:scale-[1.01] transition-all duration-200 ${className}`}
  >
    <img src={joinImg} alt="JOIN NOW — Do your Part to Keep Killing Cancers" className="w-full h-auto block" />
  </Link>
);

export default JoinNowImageButton;
