
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Container } from '@/components/ui/container';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
            <div className="prose prose-slate max-w-none">
              <p className="text-gray-500 italic">
                Terms and Conditions content will be provided by the legal department. This page is a placeholder
                until the official terms and conditions are provided.
              </p>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;
