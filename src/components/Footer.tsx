
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">CSI Labs</h3>
            <p className="text-gray-400 text-sm">
              Advancing cannabinoid-based cancer research through innovative treatment development and affordable drug solutions.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-200">Research</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/research-documents" className="text-gray-400 hover:text-white transition-colors">
                  Research Documents
                </Link>
              </li>
              <li>
                <a 
                  href="https://pubmed.ncbi.nlm.nih.gov/12746841/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Harvard Study <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-200">Community</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/token-info" className="text-gray-400 hover:text-white transition-colors">
                  Token Information
                </Link>
              </li>
              <li>
                <a 
                  href="https://polygonscan.com/token/0xcba5ca199bca0af3f6046da01169035f2c6a7ff0" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  View on Polygonscan <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-200">Get Started</h4>
            <div className="space-y-3">
              <Button 
                asChild 
                size="sm" 
                className="w-full bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90"
              >
                <Link to="/signup">Purchase Tokens</Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="sm" 
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 CSI Labs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
