import React from 'react';
import { cn } from '@/lib/utils';
import FadeInSection from './FadeInSection';
import { ExternalLink, Shield, TrendingUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
const TokenDetails: React.FC = () => {
  return <section className="section-padding bg-gradient-to-b from-white to-gray-50">
      <div className="container-custom">
        <FadeInSection>
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-cbis-dark">
              $CSi-EDP/Labs FC Token
            </h2>
            <p className="text-gray-600 mb-6">The CSi Labs token is designed for potential public trading on upper markets through future offerings based on the growth of our Lab Series funding, FDA research, and drug development success.</p>
            <div className="flex justify-center">
              <a href="https://polygonscan.com/token/0xcba5ca199bca0af3f6046da01169035f2c6a7ff0" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-cbis-blue hover:underline">
                View on Polygonscan
                <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </FadeInSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FadeInSection delay={100}>
            <div className="glass-card p-6 rounded-xl h-full">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg inline-block">
                <Shield className="h-6 w-6 text-cbis-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-cbis-dark">Token Security</h3>
              <p className="text-gray-600 mb-4">Built on the Polygon blockchain, our token provides enhanced security, lower transaction costs, and faster settlement compared to traditional approaches vehicles.</p>
              <div className="mt-auto">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Verified smart contract</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Transparent token distribution</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Secure payment processing</span>
                  </li>
                </ul>
              </div>
            </div>
          </FadeInSection>

          <FadeInSection delay={200}>
            <div className="glass-card p-6 rounded-xl h-full">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg inline-block">
                <TrendingUp className="h-6 w-6 text-cbis-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-cbis-dark">Project Potential</h3>
              <p className="text-gray-600 mb-4">The CSi Labs token is designed for potential public trading on upper markets through future offerings based on the growth of our Lab Series funding, FDA research, and drug development success.</p>
              <div className="mt-auto">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Possible dividend structure</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Future trading potential</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Growth through Lab Series model</span>
                  </li>
                </ul>
              </div>
            </div>
          </FadeInSection>

          <FadeInSection delay={300} className="md:col-span-2 lg:col-span-1">
            <div className="glass-card p-6 rounded-xl bg-gradient-to-br from-cbis-blue to-cbis-teal h-full flex flex-col">
              <h3 className="text-xl font-semibold mb-3 text-white">Token Details</h3>
              <div className="space-y-4 mb-6 flex-grow">
                <div className="flex justify-between p-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg">
                  <span className="text-white">Token Name:</span>
                  <span className="font-medium text-white">$CSi-EDP/Labs FC</span>
                </div>
                <div className="flex justify-between p-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg">
                  <span className="text-white">Symbol:</span>
                  <span className="font-medium text-white">CSL</span>
                </div>
                <div className="flex justify-between p-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg">
                  <span className="text-white">Total Supply:</span>
                  <span className="font-medium text-white">100,000,000 CSL</span>
                </div>
                <div className="flex justify-between p-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg">
                  <span className="text-white">Blockchain:</span>
                  <span className="font-medium text-white">Polygon</span>
                </div>
                <div className="p-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="text-white">Contract:</span>
                  </div>
                  <div className="text-white break-all text-xs font-mono overflow-hidden">
                    0xcba5ca199bca0af3f6046da01169035f2c6a7ff0
                  </div>
                </div>
              </div>
              <Button asChild variant="secondary" className="w-full bg-white text-cbis-blue hover:bg-opacity-90">
                <a href="https://polygonscan.com/token/0xcba5ca199bca0af3f6046da01169035f2c6a7ff0" target="_blank" rel="noopener noreferrer">
                  View on Polygonscan
                </a>
              </Button>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>;
};
export default TokenDetails;