import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Mail, Phone } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WhiteGloveServiceOptionProps {
  className?: string;
}

const CONTACT_EMAIL = 'raymond.dabney@cannabisscience.com';

const WhiteGloveServiceOption: React.FC<WhiteGloveServiceOptionProps> = ({ className }) => {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <Crown className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-medium">White Glove Service</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        VIP concierge support for contributions of <strong>$1,000.00+</strong>. Direct
        bank wire instructions, personalized onboarding, and dedicated assistance from
        the CSi Labs team.
      </p>

      <Alert className="bg-amber-50 border-amber-200 mb-4">
        <AlertDescription className="text-amber-800">
          <strong>VIP Status:</strong> Larger contributions go directly to fund our
          Harvard Award Winning Low-Cost Cancer Killing drug development, FDA Clinical
          Trials, and laboratory operations.
        </AlertDescription>
      </Alert>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
        <div>
          <h4 className="font-medium mb-1">What you receive:</h4>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Direct bank wire instructions for your contribution</li>
            <li>Personalized confirmation and receipt</li>
            <li>Priority access to VIP events and updates</li>
            <li>Recognition as a 1-Million Strong Fight Club VIP Member</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            asChild
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 text-white flex-1"
          >
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=White%20Glove%20Service%20Request%20-%20VIP%20Contribution&body=I%20would%20like%20to%20request%20White%20Glove%20Service%20for%20a%20contribution%20of%20%241%2C000%2B.%20Please%20send%20me%20bank%20wire%20instructions%20and%20VIP%20onboarding%20details.`}
            >
              <Mail className="mr-2 h-4 w-4" />
              Request White Glove Service
            </a>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <a href={`mailto:${CONTACT_EMAIL}?subject=Bank%20Wire%20Instructions%20Request`}>
              <Phone className="mr-2 h-4 w-4" />
              Bank Wire Instructions
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WhiteGloveServiceOption;
