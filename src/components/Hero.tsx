
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cbis-teal opacity-5 blur-3xl"></div>
        <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-cbis-blue opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-cbis-blue opacity-5 blur-3xl"></div>
      </div>

      <div className="container-custom relative z-10 pt-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className={`transition-all duration-1000 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="inline-block px-3 py-1 mb-6 text-xs font-medium tracking-wider uppercase rounded-full text-cbis-blue bg-blue-50 border border-blue-100">
              Harvard-Validated Research
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight text-cbis-dark">
              Revolutionizing <span className="bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent">Cancer Treatment</span> Through Innovation
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              CSi Labs is pioneering cannabinoid-based cancer treatments with Harvard-validated research. Invest in our token to help fund clinical trials and our FDA approval process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-cbis-blue to-cbis-teal text-white hover:opacity-90 transition-opacity flex-shrink-0">
                <Link to="/register">
                  Buy Tokens <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-cbis-blue text-cbis-blue hover:bg-cbis-blue/5 transition-colors flex-shrink-0">
                <Link to="/token-info">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>

          <div className={`relative transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="relative rounded-2xl overflow-hidden shadow-elevation bg-white p-2">
              <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-cbis-blue/10 to-cbis-teal/10 flex items-center justify-center">
                <div className="p-4 sm:p-6 md:p-8 text-center w-full">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent mb-3">$CSi-EDP/Labs</div>
                  <p className="text-cbis-dark mb-4">CSi Labs Token (CSL)</p>
                  <div className="flex flex-col gap-3 max-w-full mx-auto">
                    <div className="flex justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Total Supply:</span>
                      <span className="font-medium">100,000,000 CSL</span>
                    </div>
                    <div className="flex justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Blockchain:</span>
                      <span className="font-medium">Polygon</span>
                    </div>
                    <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Contract:</span>
                      </div>
                      <div className="text-gray-700 text-xs font-mono break-all overflow-hidden">
                        0xcba5ca199bca0af3f6046da01169035f2c6a7ff0
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative element */}
            <div className="absolute -z-10 w-40 h-40 rounded-full bg-cbis-blue/10 -bottom-10 -left-10 blur-2xl"></div>
            <div className="absolute -z-10 w-60 h-60 rounded-full bg-cbis-teal/10 -top-10 -right-10 blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
