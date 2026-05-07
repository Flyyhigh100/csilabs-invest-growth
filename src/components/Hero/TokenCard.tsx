import React from 'react';
import { TokenInfo as TokenInfoType } from '@/types/token';
import TokenInfo from './TokenInfo';
import { Award } from 'lucide-react';
import drRayImg from '@/assets/promo/dr-ray-harvard-award.jpg';

interface TokenCardProps {
  isLoaded: boolean;
  priceData: any[];
  volumeData: any[];
  currentPrice: number | null;
  tokenInfo: TokenInfoType | null;
  isLoading: boolean;
  hasError: boolean;
}

const PERKS = [
  'Membership',
  'Crypto & Perks',
  'Awards & Grants',
  "Contests & VIP's",
  'Contribution Perks',
  'TV Shows, Events',
  'Scholarships',
  'Jobs, Perks',
];

const TokenCard: React.FC<TokenCardProps> = ({ tokenInfo, isLoading }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-elevation bg-white">
      <div className="rounded-xl overflow-hidden bg-gradient-to-br from-cbis-blue/10 to-cbis-teal/10">
        <div className="p-4 sm:p-6 md:p-8 space-y-5">
          {/* Token name */}
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent">
              $CSi-EDP/Labs FC
            </div>
            <p className="text-sm text-gray-600 mt-1">
              It's <span className="font-bold text-cbis-teal">TIME</span> for Low-Cost Cancer
              Killing Drugs
            </p>
          </div>

          {/* Static price card */}
          <div className="bg-cbis-dark text-white rounded-xl p-4 text-center border-2 border-amber-400 shadow-md">
            <p className="text-xs uppercase tracking-wider text-amber-300 font-medium">
              CSi-Labs (CSL) Current Spot Price
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-amber-400 mt-1">$1.00 USD</p>
            <p className="text-xs text-amber-200/80 mt-1">Per Coin</p>
          </div>

          {/* Fundraising goal */}
          <div className="bg-cbis-dark text-white rounded-xl p-4 text-center border-2 border-amber-400 shadow-md">
            <p className="text-2xl sm:text-3xl font-bold text-amber-400">$20,000,000 USD</p>
            <p className="text-sm text-amber-200 mt-1">Killing Cancer Goal</p>
            
          </div>

          {/* Harvard award callout */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={drRayImg}
                alt="Dr. Raymond C. Dabney, Harvard Award Winner"
                className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 flex-shrink-0"
              />
              <div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-amber-600" />
                  <p className="text-sm font-bold text-amber-700 uppercase tracking-wide">
                    HARVARD Award Winning
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-800">Cancer Killing Success</p>
              </div>
            </div>
            <p className="text-xs text-gray-700">
              <span className="font-bold">Stage 4 Lung Cancer — Dead.</span> Skin Cancer,
              Kaposi Sarcoma, Stage 4 Breast Cancer — Dead.
            </p>
          </div>

          {/* Perks list */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-cbis-blue/10">
            <p className="text-xs uppercase tracking-wider text-cbis-blue font-bold mb-3 text-center">
              1-Million Strong Fight Club Perks
            </p>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm text-gray-700">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-start">
                  <span className="text-cbis-teal mr-1.5">•</span>
                  <span className="font-medium">{perk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Token details */}
          <TokenInfo tokenInfo={tokenInfo} isLoading={isLoading} />
        </div>
      </div>

      <div className="absolute -z-10 w-40 h-40 rounded-full bg-cbis-blue/10 -bottom-10 -left-10 blur-2xl"></div>
      <div className="absolute -z-10 w-60 h-60 rounded-full bg-cbis-teal/10 -top-10 -right-10 blur-3xl"></div>
    </div>
  );
};

export default TokenCard;
