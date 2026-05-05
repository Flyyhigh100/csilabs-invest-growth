import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Mail, Phone, DollarSign, Star, Building2, Check } from 'lucide-react';

interface WhiteGloveServiceOptionProps {
  className?: string;
}

const CONTACT_EMAIL = 'raymond.dabney@cannabisscience.com';

const HIGHLIGHTS = [
  { icon: DollarSign, label: '$1,000+ Contributions' },
  { icon: Star, label: 'VIP Status' },
  { icon: Building2, label: 'Bank Wire Instructions' },
];

const PERKS = [
  'Direct bank wire instructions for your contribution',
  'Personalized confirmation and receipt',
  'Priority access to VIP events and updates',
  'Recognition as a 1-Million Strong Fight Club VIP Member',
];

const WhiteGloveServiceOption: React.FC<WhiteGloveServiceOptionProps> = ({ className }) => {
  return (
    <div
      className={`relative rounded-2xl border-2 border-amber-500 bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 p-5 md:p-6 shadow-lg ${className ?? ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-amber-900">White Glove Service</h3>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow">
          VIP
        </span>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        {HIGHLIGHTS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-amber-300"
          >
            <Icon className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-amber-900">{label}</span>
          </div>
        ))}
      </div>

      {/* What you receive */}
      <div className="bg-white/80 rounded-xl border border-amber-300 p-4 mb-4">
        <h4 className="font-semibold text-amber-900 mb-2">What you receive:</h4>
        <ul className="space-y-1.5">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-2 text-sm text-amber-950">
              <Check className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <span>{perk}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-amber-800 mb-4 italic">
        Larger contributions go directly to fund our Harvard Award Winning Low-Cost Cancer
        Killing drug development, FDA Clinical Trials, and laboratory operations.
      </p>

      {/* CTAs */}
      <div className="space-y-2">
        <Button
          asChild
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-md"
        >
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=White%20Glove%20Service%20Request%20-%20VIP%20Contribution&body=I%20would%20like%20to%20request%20White%20Glove%20Service%20for%20a%20contribution%20of%20%241%2C000%2B.%20Please%20send%20me%20bank%20wire%20instructions%20and%20VIP%20onboarding%20details.`}
          >
            <Mail className="mr-2 h-4 w-4" />
            Request White Glove Service
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full border-amber-500 text-amber-800 hover:bg-amber-100"
        >
          <a href={`mailto:${CONTACT_EMAIL}?subject=Bank%20Wire%20Instructions%20Request`}>
            <Phone className="mr-2 h-4 w-4" />
            Bank Wire Instructions
          </a>
        </Button>
      </div>
    </div>
  );
};

export default WhiteGloveServiceOption;
