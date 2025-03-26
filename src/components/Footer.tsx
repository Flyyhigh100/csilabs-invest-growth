
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-cbis-blue text-white py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">CSi Labs</h3>
            <p className="text-blue-100 mb-4">
              Revolutionizing cancer treatment through Harvard-validated cannabinoid research.
            </p>
            <div className="flex items-center">
              <a 
                href="https://polygonscan.com/token/0xcba5ca199bca0af3f6046da01169035f2c6a7ff0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-100 hover:text-white flex items-center"
              >
                <span>View Token on Polygonscan</span>
                <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-blue-100 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/token-info" className="text-blue-100 hover:text-white transition-colors">
                  Token Information
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-blue-100 hover:text-white transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-blue-100 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-blue-100 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="#" className="text-blue-100 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-blue-100 hover:text-white transition-colors">
                  Geographic Restrictions
                </Link>
              </li>
              <li>
                <Link to="#" className="text-blue-100 hover:text-white transition-colors">
                  Token Disclaimer
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Token Details</h3>
            <ul className="space-y-2 text-blue-100">
              <li className="flex justify-between">
                <span>Name:</span>
                <span>$CSi-EDP/Labs FC</span>
              </li>
              <li className="flex justify-between">
                <span>Symbol:</span>
                <span>CSL</span>
              </li>
              <li className="flex justify-between">
                <span>Total Supply:</span>
                <span>100,000,000</span>
              </li>
              <li className="flex justify-between">
                <span>Blockchain:</span>
                <span>Polygon</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-blue-800 text-center text-blue-200">
          <p>&copy; {new Date().getFullYear()} CBIS. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Important: Token investments involve risk. Do your own research before investing.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
