
import React, { useEffect } from 'react';
import Hero from '@/components/Hero';
import ResearchHighlights from '@/components/ResearchHighlights';
import TokenDetails from '@/components/TokenDetails';
import InvestmentModel from '@/components/InvestmentModel';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Index: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-transition min-h-screen">
      <Navbar />
      <Hero />
      <ResearchHighlights />
      <TokenDetails />
      <InvestmentModel />
      <Footer />
    </div>
  );
};

export default Index;
