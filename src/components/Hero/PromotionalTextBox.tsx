
import React from 'react';
import { Link } from 'react-router-dom';
import { Medal } from 'lucide-react';

const PromotionalTextBox: React.FC = () => {
  return (
    <Link 
      to="/signup"
      className="block bg-gradient-to-r from-cbis-blue to-cbis-teal p-4 md:p-6 rounded-2xl shadow-elevation text-white hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <div className="text-center">
        <div className="flex items-center justify-center mb-3">
          <Medal className="w-8 h-8 text-yellow-400 mr-2" />
          <h3 className="text-lg md:text-xl font-bold">
            Cannabis Science Digital HUB - Tracking all your CBIS-EDP Assets
          </h3>
        </div>
        
        <div className="inline-block px-4 py-2 mb-4 text-sm md:text-base font-bold bg-yellow-400 text-cbis-dark rounded-full">
          Register for your Free Account
        </div>
        
        <div className="space-y-3 text-left mb-4">
          <div className="flex items-start space-x-3">
            <span className="bg-white text-cbis-blue rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">1</span>
            <span className="font-medium text-sm md:text-base">
              Register for your <span className="font-bold text-yellow-400">Free Account</span>
            </span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="bg-white text-cbis-blue rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">2</span>
            <span className="font-medium text-sm md:text-base">1-Million Strong Killing Cancers - CSi Labs Crypto Trading</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="bg-white text-cbis-blue rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">3</span>
            <span className="font-medium text-sm md:text-base">Track your CBIS Shares to Trading</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4">
          <p className="text-sm md:text-base font-medium leading-relaxed">
            Welcome to the Free CSi-EDP Digital HUB Designed for you to communicate & track all your CSi-EDP Holdings & Grow with us!
          </p>
        </div>
        
        <div className="text-center">
          <span className="text-sm opacity-90">Click here to get started →</span>
        </div>
      </div>
    </Link>
  );
};

export default PromotionalTextBox;
