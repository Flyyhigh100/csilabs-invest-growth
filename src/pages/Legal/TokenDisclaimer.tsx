
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Container } from '@/components/ui/container';

const TokenDisclaimer: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Token Disclaimer</h1>
            <div className="prose prose-slate max-w-none">
              <p className="mb-4">
                Please be aware that participation in this token sale carries a risk of financial loss. 
                Cryptocurrencies are highly volatile and can fluctuate significantly in value. Buyers 
                should conduct their own thorough research and consult with financial professionals to 
                assess the risks involved before purchasing digital assets.
              </p>
              <p className="mb-4">
                We advise prudence and caution when participating in the cryptocurrency market. 
                CBIS coin is a meme coin sold as fun way to support cancer research and makes no promises 
                of return on investment, profit share, or other guarantees of money making potential.
              </p>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default TokenDisclaimer;
