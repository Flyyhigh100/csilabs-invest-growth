
import React from 'react';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';

interface LegalAcknowledgmentProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  required?: boolean;
}

export const LegalAcknowledgment: React.FC<LegalAcknowledgmentProps> = ({
  id,
  checked,
  onCheckedChange,
  required = true
}) => {
  return (
    <div className="flex items-start space-x-2 mb-4">
      <Checkbox 
        id={id} 
        checked={checked} 
        onCheckedChange={onCheckedChange}
        required={required}
      />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I acknowledge that I have read and agree to the{' '}
          <Link to="/legal/terms-and-conditions#top" className="text-blue-600 hover:text-blue-800 hover:underline" target="_blank">
            Terms & Conditions
          </Link>,{' '}
          <Link to="/legal/token-disclaimer#top" className="text-blue-600 hover:text-blue-800 hover:underline" target="_blank">
            Token Disclaimer
          </Link>,{' '}
          <Link to="/legal/foundation-disclosure#top" className="text-blue-600 hover:text-blue-800 hover:underline" target="_blank">
            Foundation Disclosure
          </Link> and{' '}
          <Link to="/legal/geographic-restrictions#top" className="text-blue-600 hover:text-blue-800 hover:underline" target="_blank">
            Geographic Restrictions
          </Link>.
        </label>
      </div>
    </div>
  );
};
