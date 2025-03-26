
import React from 'react';
import FadeInSection from './FadeInSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Beaker, TrendingUp, BarChart4, CheckCircle2 } from 'lucide-react';

const InvestmentModel: React.FC = () => {
  return (
    <section className="section-padding bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-40 right-0 w-96 h-96 rounded-full bg-cbis-teal opacity-5 blur-3xl"></div>
        <div className="absolute bottom-40 left-0 w-72 h-72 rounded-full bg-cbis-blue opacity-5 blur-3xl"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <FadeInSection>
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-cbis-dark">
              The Lab Series Investment Model
            </h2>
            <p className="text-gray-600">
              Our innovative Lab Series is the core of our business model, creating value for token holders through strategic research and development.
            </p>
          </div>
        </FadeInSection>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <FadeInSection direction="left">
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                  <Beaker className="h-6 w-6 text-cbis-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-cbis-dark">Research & Development</h3>
                  <p className="text-gray-600">
                    Each cancer drug and other critical ailment targets will pass through our Lab Series, focusing on cannabinoid-based treatments with Harvard-validated efficacy.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                  <BarChart4 className="h-6 w-6 text-cbis-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-cbis-dark">Asset Growth Multiplication</h3>
                  <p className="text-gray-600">
                    The Lab Series is designed to multiply asset growth through strategic research, clinical trials, and eventual FDA approval, creating substantial value.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-cbis-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-cbis-dark">Token Holder Benefits</h3>
                  <p className="text-gray-600">
                    Token holders may receive a percentage of the multiplied asset growth from our Lab Series, with potential dividend structures as our treatments progress.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-cbis-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-cbis-dark">Long-term Vision</h3>
                  <p className="text-gray-600">
                    Our token is designed for public trading with future integration into our complete business ecosystem, maximizing value for early investors.
                  </p>
                </div>
              </div>
              
              <div className="pt-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-cbis-blue to-cbis-teal text-white hover:opacity-90 transition-opacity">
                  <Link to="/register">
                    Invest Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </FadeInSection>
          
          <FadeInSection direction="right" delay={200}>
            <div className="relative rounded-2xl overflow-hidden shadow-elevation bg-white p-6">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent">
                  Investment Flow
                </h3>
                
                <div className="space-y-8 relative">
                  {/* Vertical connection line */}
                  <div className="absolute top-6 bottom-6 left-6 w-0.5 bg-gradient-to-b from-cbis-blue to-cbis-teal"></div>
                  
                  <div className="flex items-start gap-6 relative">
                    <div className="w-12 h-12 rounded-full bg-cbis-blue text-white flex items-center justify-center font-bold text-lg z-10">1</div>
                    <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 text-cbis-dark">Token Purchase</h4>
                      <p className="text-gray-600 text-sm">Investors purchase $CSi-EDP/Labs tokens to fund research and laboratory acquisitions.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-6 relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cbis-blue to-cbis-teal text-white flex items-center justify-center font-bold text-lg z-10">2</div>
                    <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 text-cbis-dark">Lab Series Development</h4>
                      <p className="text-gray-600 text-sm">Funds support our Lab Series, focusing on cancer drug development and clinical research.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-6 relative">
                    <div className="w-12 h-12 rounded-full bg-cbis-teal text-white flex items-center justify-center font-bold text-lg z-10">3</div>
                    <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 text-cbis-dark">Value Creation</h4>
                      <p className="text-gray-600 text-sm">FDA approvals and successful treatments multiply asset value throughout the process.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-6 relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cbis-teal to-green-500 text-white flex items-center justify-center font-bold text-lg z-10">4</div>
                    <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 text-cbis-dark">Investor Returns</h4>
                      <p className="text-gray-600 text-sm">Token holders receive potential dividends and benefit from asset growth and future token value appreciation.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -z-10 w-40 h-40 rounded-full bg-cbis-blue/5 -bottom-10 -left-10 blur-2xl"></div>
              <div className="absolute -z-10 w-60 h-60 rounded-full bg-cbis-teal/5 -top-10 -right-10 blur-3xl"></div>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

export default InvestmentModel;
