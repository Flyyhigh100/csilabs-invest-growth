
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from 'lucide-react';

interface PaymentOptionProps { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  onClick: () => void; 
  disabled?: boolean;
  recommended?: boolean;
  highlight?: boolean;
  cryptoHighlight?: boolean;
}

const PaymentOption: React.FC<PaymentOptionProps> = ({
  title, 
  description, 
  icon, 
  onClick, 
  disabled = false,
  recommended = false,
  highlight = false,
  cryptoHighlight = false
}) => (
  <Card 
    className={`cursor-pointer border-2 transition-all 
      ${disabled ? 'opacity-60' : 'hover:border-cbis-blue hover:shadow-md'} 
      ${recommended ? 'border-cbis-teal' : 'border-transparent'}
      ${highlight ? 'shadow-lg ring-2 ring-cbis-blue ring-opacity-50 bg-blue-50/30' : ''}
      ${cryptoHighlight ? 'shadow-md ring-1 ring-cbis-teal ring-opacity-50 bg-blue-50/20' : ''}
    `}
  >
    <CardContent className="p-6" onClick={disabled ? undefined : onClick}>
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-full ${highlight ? 'bg-cbis-blue text-white' : cryptoHighlight ? 'bg-cbis-teal/20 text-cbis-blue' : 'bg-blue-50'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`font-medium text-lg ${highlight ? 'text-cbis-blue' : cryptoHighlight ? 'text-cbis-teal' : ''}`}>{title}</h3>
            {recommended && (
              <span className="bg-cbis-teal/10 text-cbis-teal text-xs px-2 py-1 rounded-full flex items-center">
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Recommended
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1">{description}</p>
        </div>
        <ChevronRight className={`h-5 w-5 ${highlight ? 'text-cbis-blue' : cryptoHighlight ? 'text-cbis-teal' : 'text-gray-400'}`} />
      </div>
    </CardContent>
  </Card>
);

export default PaymentOption;
