import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FadeInSection from '@/components/FadeInSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ExternalLink, PieChart, TrendingUp, Shield, ArrowRight, DollarSign, ShieldCheck } from 'lucide-react';
const TokenInfo: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return <div className="page-transition min-h-screen">
      <Navbar />

      <div className="pt-24 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom">
          <FadeInSection>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-cbis-dark">
                $CSi-EDP/Labs FC <span className="text-cbis-blue">(CSL)</span> Token
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">The CSi Labs token is designed to fund our affordable cancer treatments, making them accessible to millions who cannot afford today's high-priced drugs, while providing contributors with growth potential.</p>
            </div>
          </FadeInSection>

          <FadeInSection delay={100}>
            <div className="glass-card p-6 md:p-8 rounded-xl mb-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider uppercase rounded-full text-cbis-blue bg-blue-50 border border-blue-100">
                    Token Details
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-cbis-dark">
                    Polygon-Based Security Token
                  </h2>
                  <p className="text-gray-600 mb-6">
                    CSi Labs token is built on the Polygon blockchain, offering enhanced security, lower transaction costs, and faster settlement compared to Ethereum mainnet.
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Token Name:</span>
                      <span className="font-medium">$CSi-EDP/Labs FC</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Symbol:</span>
                      <span className="font-medium">CSL</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Total Supply:</span>
                      <span className="font-medium">100,000,000 CSL</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Blockchain:</span>
                      <span className="font-medium">Polygon</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Contract Address:</span>
                      </div>
                      <div className="text-gray-800 break-all text-sm font-mono">
                        0xcba5ca199bca0af3f6046da01169035f2c6a7ff0
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <a href="https://polygonscan.com/token/0xcba5ca199bca0af3f6046da01169035f2c6a7ff0" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-cbis-blue hover:underline">
                      View on Polygonscan
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                </div>
                <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-cbis-blue to-cbis-teal text-white p-8 flex flex-col items-center justify-center h-full min-h-[320px]">
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-cbis-blue to-cbis-teal flex items-center justify-center">
                      <PieChart className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent">
                      Token Distribution
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Our token distribution is designed to prioritize research funding while maintaining a reserve for future development and partnerships.
                    </p>
                    <Button className="bg-gradient-to-r from-cbis-blue to-cbis-teal text-white" asChild>
                      <Link to="/register">
                        Purchase Tokens <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <FadeInSection delay={200}>
              <div className="glass-card p-6 rounded-xl h-full">
                <div className="mb-4 p-3 bg-blue-50 rounded-lg inline-block">
                  <DollarSign className="h-6 w-6 text-cbis-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-cbis-dark">Affordable Cancer Treatment</h3>
                <p className="text-gray-600">
                  Unlike existing cancer drugs that cost patients thousands monthly, our mission is to create affordable treatments accessible to millions of patients worldwide who cannot afford today's high-cost therapies.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="font-medium mb-2 text-cbis-dark">What Makes Us Different:</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Low-cost treatment model</li>
                    <li>• Non-chemical cancer-killing approach</li>
                    <li>• Wider accessibility for patients</li>
                    <li>• Focus on quality of life during treatment</li>
                  </ul>
                </div>
              </div>
            </FadeInSection>

            <FadeInSection delay={300}>
              <div className="glass-card p-6 rounded-xl h-full">
                <div className="mb-4 p-3 bg-blue-50 rounded-lg inline-block">
                  <ShieldCheck className="h-6 w-6 text-cbis-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-cbis-dark">Treatments Without Side Effects</h3>
                <p className="text-gray-600 mb-4">
                  Our cannabinoid-based treatments eliminate cancer cells without the debilitating side effects associated with traditional chemical therapies, maintaining patient quality of life.
                </p>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-1 text-cbis-dark">Harvard-Validated Research</h4>
                    <p className="text-sm text-gray-600">Our approach has been validated by Harvard Medical School researchers.</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-1 text-cbis-dark">Laboratory Acquisitions</h4>
                    <p className="text-sm text-gray-600">Active negotiations for research facilities in Las Vegas and California.</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-1 text-cbis-dark">FDA Approval Process</h4>
                    <p className="text-sm text-gray-600">Funding will accelerate the FDA approval process for our treatments.</p>
                  </div>
                </div>
              </div>
            </FadeInSection>

            <FadeInSection delay={400} className="md:col-span-2 lg:col-span-1">
              <div className="glass-card p-6 rounded-xl h-full bg-gradient-to-br from-cbis-blue to-cbis-teal text-white">
                <h3 className="text-xl font-semibold mb-4">Investment Journey</h3>
                <p className="text-blue-50 mb-6">
                  Your journey from registration to receiving CSi Labs tokens is straightforward and secure.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-white text-cbis-blue flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-medium mb-1">Registration</h4>
                      <p className="text-sm text-blue-50">Create your account to begin the investment process.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-white text-cbis-blue flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-medium mb-1">KYC Verification</h4>
                      <p className="text-sm text-blue-50">Complete identity verification through WorldKYC.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-white text-cbis-blue flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-medium mb-1">Token Purchase</h4>
                      <p className="text-sm text-blue-50">Purchase tokens via credit card or cryptocurrency.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-white text-cbis-blue flex items-center justify-center font-bold">4</div>
                    <div>
                      <h4 className="font-medium mb-1">Token Distribution</h4>
                      <p className="text-sm text-blue-50">Receive your tokens in your specified wallet address.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Button variant="secondary" className="w-full bg-white text-cbis-blue hover:bg-opacity-90" asChild>
                    <Link to="/register">
                      Start Your Investment
                    </Link>
                  </Button>
                </div>
              </div>
            </FadeInSection>
          </div>

          <FadeInSection>
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-cbis-dark">
                Ready to Help Make Cancer Treatment Affordable?
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Join our token sale to help fund low-cost cancer treatments without harsh side effects, making them accessible to millions of patients worldwide.
              </p>
              <Button size="lg" className="bg-gradient-to-r from-cbis-blue to-cbis-teal text-white" asChild>
                <Link to="/register">
                  Register Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeInSection>
        </div>
      </div>

      <Footer />
    </div>;
};
export default TokenInfo;