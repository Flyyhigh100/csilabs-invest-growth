
import React from 'react';
import LegalPageLayout from '@/components/Legal/LegalPageLayout';

const GeographicRestrictions: React.FC = () => {
  return (
    <LegalPageLayout title="Geographic Restrictions">
      <div className="prose prose-slate max-w-none">
        <p className="mb-4" id="restrictions-intro">
          Please note that participation in our token sale is subject to geographic 
          restrictions in compliance with international sanctions and embargoes imposed 
          by the Office of Foreign Assets Control (OFAC). As such, individuals and entities 
          from the following sanctioned countries are prohibited from accessing or engaging 
          in our token sale:
        </p>
        <ul className="list-disc pl-6 mb-4" id="restricted-countries">
          <li>Iran</li>
          <li>North Korea</li>
          <li>Syria</li>
        </ul>
        <p className="mb-4" id="compliance">
          We are committed to maintaining full compliance with all applicable laws and 
          regulations, and we appreciate your understanding and cooperation. If you have 
          any questions or concerns regarding these restrictions, please contact our compliance team.
        </p>
      </div>
    </LegalPageLayout>
  );
};

export default GeographicRestrictions;
