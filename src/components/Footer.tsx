import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Instagram, Facebook } from 'lucide-react';

// Custom Threads icon component
const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className}
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.186 24h-.007c-5.947-.002-11.183-3.51-13.597-9.113L0 14.396l1.593-.51c2.59-2.837 5.955-4.401 9.593-4.401 4.368 0 8.368 2.186 10.715 5.85l1.591.51-1.414.491C19.65 20.49 16.17 24 12.186 24zM2.78 14.396c1.947 4.729 6.427 7.604 11.405 7.604 3.176 0 6.082-1.244 8.176-3.507-1.982-2.749-5.1-4.378-8.549-4.378-3.074 0-5.965 1.235-8.032 3.281z"/>
    <path d="M12.025 18.163c-1.061 0-1.931-.281-2.609-.84-.678-.56-1.017-1.297-1.017-2.214 0-.916.339-1.654 1.017-2.214.678-.559 1.548-.84 2.609-.84s1.931.281 2.609.84c.678.56 1.017 1.298 1.017 2.214 0 .917-.339 1.654-1.017 2.214-.678.559-1.548.84-2.609.84zm0-4.908c-.726 0-1.326.185-1.8.555-.474.37-.711.851-.711 1.444s.237 1.074.711 1.444c.474.37 1.074.555 1.8.555s1.326-.185 1.8-.555c.474-.37.711-.851.711-1.444s-.237-1.074-.711-1.444c-.474-.37-1.074-.555-1.8-.555z"/>
    <path d="M12.025 11.097c-.528 0-.956-.428-.956-.956V6.715c0-.528.428-.956.956-.956s.956.428.956.956v3.426c0 .528-.428.956-.956.956z"/>
    <path d="M8.599 8.525c-.245 0-.485-.094-.669-.278-.184-.184-.278-.424-.278-.669s.094-.485.278-.669l2.426-2.426c.369-.369.969-.369 1.338 0s.369.969 0 1.338L9.268 8.247c-.184.184-.424.278-.669.278z"/>
    <path d="M15.451 8.525c-.245 0-.485-.094-.669-.278L12.356 5.821c-.369-.369-.369-.969 0-1.338s.969-.369 1.338 0l2.426 2.426c.184.184.278.424.278.669s-.094.485-.278.669c-.184.184-.424.278-.669.278z"/>
  </svg>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-cbis-blue text-white py-12 mt-auto">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">CSi Labs</h3>
            <p className="text-blue-100 mb-4">
              Revolutionizing cancer treatment through Harvard-validated cannabinoid research.
            </p>
            <div className="mb-4">
              <a href="https://polygonscan.com/token/0xcba5ca199bca0af3f6046da01169035f2c6a7ff0" target="_blank" rel="noopener noreferrer" className="text-blue-100 hover:text-white flex items-center">
                <span>View Token on Polygonscan</span>
                <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </div>
            <div className="text-sm text-blue-200">
              <div className="mb-1">
                <span className="font-medium">$CSi-EDP/Labs FC (CSL)</span>
              </div>
              <div className="mb-1">Supply: 100,000,000 | Polygon</div>
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
                <Link to="/research-documents" className="text-blue-100 hover:text-white transition-colors">
                  Research Documents
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-blue-100 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/payments" className="text-blue-100 hover:text-white transition-colors">
                  Purchase Now to Contribute
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-blue-100 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/legal/terms-and-conditions#top" className="text-blue-100 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/legal/foundation-disclosure#top" className="text-blue-100 hover:text-white transition-colors">
                  Foundation Disclosure
                </Link>
              </li>
              <li>
                <Link to="/legal/geographic-restrictions#top" className="text-blue-100 hover:text-white transition-colors">
                  Geographic Restrictions
                </Link>
              </li>
              <li>
                <Link to="/legal/token-disclaimer#top" className="text-blue-100 hover:text-white transition-colors">
                  Token Disclaimer
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex flex-wrap gap-4">
              <a 
                href="https://www.instagram.com/csilabs?igsh=NW9scm14NmdsdWN4&utm_source=qr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-100 hover:text-white transition-colors hover:scale-110 transform duration-200"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a 
                href="https://www.threads.com/@csilabs?invite=0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-100 hover:text-white transition-colors hover:scale-110 transform duration-200"
                aria-label="Follow us on Threads"
              >
                <ThreadsIcon className="h-6 w-6" />
              </a>
              <a 
                href="https://www.tiktok.com/@1millstrong?_t=ZM-8wqhp1g5Szu&_r=1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-100 hover:text-white transition-colors hover:scale-110 transform duration-200"
                aria-label="Follow us on TikTok"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
              <a 
                href="https://x.com/1millfight?s=11&t=K2_jpaPOwmtOryztX7lD9g" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-100 hover:text-white transition-colors hover:scale-110 transform duration-200"
                aria-label="Follow us on X"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                </svg>
              </a>
              <a 
                href="https://www.facebook.com/share/1Az834ZoGJ/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-100 hover:text-white transition-colors hover:scale-110 transform duration-200"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
            </div>
            <div className="mt-4 text-sm text-blue-200">
              <p>Join our community and stay updated on our cancer research breakthroughs!</p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-blue-800 text-center text-blue-200">
          <p>&copy; {new Date().getFullYear()} CBIS. All rights reserved.</p>
          <p className="mt-2 text-sm">Important: Token contributions involve potential risk. Do your own research before contributing.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
