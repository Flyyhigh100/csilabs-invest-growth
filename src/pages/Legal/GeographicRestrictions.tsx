
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Container } from '@/components/ui/container';

const GeographicRestrictions: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Geographic Restrictions</h1>
            <div className="prose prose-slate max-w-none">
              <p className="mb-4">
                Please note that participation in our token sale is subject to geographic 
                restrictions in compliance with international sanctions and embargoes imposed 
                by the Office of Foreign Assets Control (OFAC). As such, individuals and entities 
                from the following sanctioned countries are prohibited from accessing or engaging 
                in our token sale:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Iran</li>
                <li>North Korea</li>
                <li>Syria</li>
              </ul>
              <p className="mb-4">
                We are committed to maintaining full compliance with all applicable laws and 
                regulations, and we appreciate your understanding and cooperation. If you have 
                any questions or concerns regarding these restrictions, please contact our compliance team.
              </p>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default GeographicRestrictions;
