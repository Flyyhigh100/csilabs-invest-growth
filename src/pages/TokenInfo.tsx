import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FadeInSection from '@/components/FadeInSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ExternalLink, PieChart, TrendingUp, Shield, ArrowRight, DollarSign, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import MultiSourceChartWidget from '@/components/TokenPricing/MultiSourceChartWidget';

const TokenInfo: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return <div className="page-transition min-h-screen">
      <Navbar />

      <div className="pt-24 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom">
          <FadeInSection>
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-cbis-dark">
                $CSi-EDP/Labs FC <span className="text-cbis-blue">(CSL)</span> Token
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                The CSi Labs meme token is designed to fund our affordable cancer treatments, making them accessible to millions who cannot afford today's high-priced drugs, while offering a fun way for the community to support serious cancer research.
              </p>
            </div>
          </FadeInSection>

          <FadeInSection delay={50}>
            <Card className="border border-blue-100 bg-blue-50/30 mb-10 shadow-sm">
              <CardContent className="p-6">
                <div className="flex gap-4 items-center">
                  <div className="bg-gradient-to-r from-cbis-blue to-cbis-teal p-3 rounded-full text-white">
                    <PieChart className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1 text-cbis-dark">Meme Token With a Serious Purpose</h3>
                    <p className="text-gray-600">
                      Our CBIS meme token combines the fun and community spirit of crypto culture with a serious mission: funding affordable cancer treatments. As a meme token, we make no promises of ROI, just the opportunity to support groundbreaking research in an innovative way.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeInSection>

          <FadeInSection delay={100}>
            <div className="glass-card p-6 md:p-8 rounded-xl mb-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider uppercase rounded-full text-cbis-blue bg-blue-50 border border-blue-100">
                    Token Details
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-cbis-dark">
                    Multi-Blockchain Token
                  </h2>
                  <p className="text-gray-600 mb-6">
                    CSi Labs token is available on both Polygon and Solana blockchains, offering flexibility and access across multiple networks with enhanced security and lower transaction costs.
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
                    
                    {/* Blockchain Contracts */}
                    <div className="space-y-2">
                      <div className="text-gray-600 font-medium">Blockchain Contracts:</div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Polygon:</span>
                        </div>
                        <div className="text-gray-800 break-all text-sm font-mono">
                          0xcba5ca199bca0af3f6046da01169035f2c6a7ff0
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Solana:</span>
                        </div>
                        <div className="text-gray-800 break-all text-sm font-mono">
                          3iU6Upm7bSx7VYFLfxsTGP1qmPCy6A7v6ddkmeNQtLqD
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <a href="https://polygonscan.com/token/0xcba5ca199bca0af3f6046da01169035f2c6a7ff0" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-cbis-blue hover:underline mr-4">
                      View on Polygonscan
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                    <a href="https://solscan.io/token/3iU6Upm7bSx7VYFLfxsTGP1qmPCy6A7v6ddkmeNQtLqD" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-cbis-blue hover:underline mr-4">
                      View on Solscan
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                    <a href="https://www.dextools.io/app/en/polygon/pair-explorer/0xb85372c56884a906ab33c0e99fea572c7c6ad7eb" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-cbis-blue hover:underline">
                      View on DEXTools
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                </div>
                
                {/* ... keep existing code (right column with gradient background and distribution info) ... */}
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
                        Purchase Now to Contribute <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </FadeInSection>

          {/* Live Trading Chart Section */}
          <FadeInSection delay={150}>
            <div className="mb-16">
              <MultiSourceChartWidget 
                poolAddress="0xb85372c56884a906ab33c0e99fea572c7c6ad7eb"
                symbol="POLYGON:CSLUSDC"
              />
            </div>
          </FadeInSection>

          {/* Feature cards, contribution journey, and CTA sections */}
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
                <h3 className="text-xl font-semibold mb-6">Contribution Journey</h3>
                <p className="text-blue-50 mb-6">
                  Your journey from registration to receiving CSi Labs meme tokens is straightforward and secure.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="min-w-[48px] h-[32px] rounded-full bg-white text-cbis-blue flex items-center justify-center font-bold text-lg px-4 shadow-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-lg mb-1">Registration</h4>
                      <p className="text-sm text-blue-50">Create your account to begin the contribution process.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="min-w-[48px] h-[32px] rounded-full bg-white text-cbis-blue flex items-center justify-center font-bold text-lg px-4 shadow-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-lg mb-1">KYC Verification</h4>
                      <p className="text-sm text-blue-50">Complete identity verification if applicable.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="min-w-[48px] h-[32px] rounded-full bg-white text-cbis-blue flex items-center justify-center font-bold text-lg px-4 shadow-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-lg mb-1">Meme Token Purchase</h4>
                      <p className="text-sm text-blue-50">Store your wallet address, fund it with cryptocurrency, and make your token contribution.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="min-w-[48px] h-[32px] rounded-full bg-white text-cbis-blue flex items-center justify-center font-bold text-lg px-4 shadow-sm">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium text-lg mb-1">Token Distribution</h4>
                      <p className="text-sm text-blue-50">Receive your meme tokens in your specified wallet address.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Button variant="secondary" className="w-full bg-white text-cbis-blue hover:bg-opacity-90" asChild>
                    <Link to="/register">
                      Start Your Contribution
                    </Link>
                  </Button>
                </div>
              </div>
            </FadeInSection>
          </div>

          <FadeInSection>
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-cbis-dark">Ready to Join Our Cancer Killing Community?</h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Join via our meme token community to help fund low-cost cancer treatments without harsh side effects, making them accessible to millions of patients worldwide.</p>
              <Button size="lg" className="bg-gradient-to-r from-cbis-blue to-cbis-teal text-white" asChild>
                <Link to="/register">
                  Purchase Now to Contribute <ArrowRight className="ml-2 h-4 w-4" />
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
