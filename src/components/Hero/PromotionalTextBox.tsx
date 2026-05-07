import React from 'react';
import { Link } from 'react-router-dom';
import celebrationImg from '@/assets/promo/celebrating-1m-strong.jpg';

const PromotionalTextBox: React.FC = () => {
  return (
    <Link
      to="/signup"
      className="block bg-gradient-to-br from-cbis-dark to-black p-4 md:p-6 rounded-2xl shadow-elevation text-white hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-pointer border border-amber-500/30"
    >
      <div className="text-center">
        <img
          src={celebrationImg}
          alt="Celebrating 1-Million Strong Killing Cancers Foundation - Congratulations New Fight Club Members!"
          className="w-full h-auto rounded-xl mb-4 shadow-lg"
        />

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-4 text-left">
          <p className="text-base md:text-lg font-bold mb-3 text-amber-400">
            YOUR Contributions and Memberships <span className="text-amber-300">$$$'s</span>
          </p>
          <ul className="space-y-2 text-sm md:text-base">
            <li>
              <span className="font-bold text-amber-400">GO DIRECTLY</span> towards Low-Cost
              Cancer Killing Drug Releases
            </li>
            <li>
              <span className="font-bold text-amber-400">GO DIRECTLY</span> towards paying for
              Laboratory Operations
            </li>
            <li>
              <span className="font-bold text-amber-400">GO DIRECTLY</span> extended HARVARD
              Award Winning Research
            </li>
            <li>
              <span className="font-bold text-amber-400">GO DIRECTLY</span> for FDA Drug
              Development &amp; Commercialization
            </li>
          </ul>
        </div>

        <p className="text-base md:text-lg font-bold mb-4">
          <span className="text-white">EVERYONE has been </span>
          <span className="text-amber-400">AFFECTED</span>
          <span className="text-white"> by Cancers!</span>
        </p>

        <h3 className="text-lg md:text-xl font-bold mb-4 text-amber-400">
          It's as EASY as 1, 2, 3 ...
        </h3>

        <div className="space-y-3 text-left mb-4">
          <div className="flex items-start space-x-3">
            <span className="bg-amber-400 text-cbis-dark rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">
              1
            </span>
            <span className="font-medium text-sm md:text-base">
              <span className="font-bold text-amber-400">REGISTER</span> for FREE 1 Million
              Strong Membership
            </span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="bg-amber-400 text-cbis-dark rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">
              2
            </span>
            <span className="font-medium text-sm md:text-base">
              <span className="font-bold text-amber-400">CONNECT</span> your Crypto Wallet or
              VIP Donations
            </span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="bg-amber-400 text-cbis-dark rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">
              3
            </span>
            <span className="font-medium text-sm md:text-base">
              <span className="font-bold text-amber-400">CONTRIBUTE</span> to Low-Cost Cancer
              Killing Drugs!
            </span>
          </div>
        </div>

        <div className="inline-block px-5 py-2 text-sm md:text-base font-bold bg-amber-400 text-cbis-dark rounded-full hover:bg-amber-300 transition-colors">
          Join Now — Register Free →
        </div>
      </div>
    </Link>
  );
};

export default PromotionalTextBox;
