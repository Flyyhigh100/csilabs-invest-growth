
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Instagram, Facebook } from 'lucide-react';

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
              <a 
                href="https://www.threads.com/@csilabs?invite=0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-100 hover:text-white transition-colors hover:scale-110 transform duration-200"
                aria-label="Follow us on Threads"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.001v-.017C1.5 8.394 2.35 5.54 3.995 3.491 5.845 1.205 8.6.024 12.181 0h.014c2.747.02 5.129.725 6.977 2.077 1.858 1.361 2.888 3.252 2.888 5.486 0 1.504-.438 2.898-1.195 4.019-.732 1.085-1.825 1.957-3.257 2.6-.717.322-1.503.544-2.336.661a11.48 11.48 0 0 1-2.794.171h-.025c-1.276-.007-2.382-.171-3.29-.485-.873-.301-1.558-.737-2.037-1.297-.442-.516-.662-1.108-.662-1.777 0-.817.347-1.564 1.033-2.224.653-.63 1.564-1.041 2.712-1.223.575-.091 1.191-.136 1.835-.136.012 0 .023 0 .034.001.325.003.634.024.922.066.576.084 1.069.231 1.466.437.198.103.362.218.49.343.13.127.195.264.195.409 0 .07-.016.138-.046.203a.707.707 0 0 1-.125.177.624.624 0 0 1-.187.125.515.515 0 0 1-.22.048c-.044 0-.087-.006-.128-.017a1.24 1.24 0 0 1-.23-.075 3.325 3.325 0 0 0-.62-.19 4.79 4.79 0 0 0-.748-.061c-.543 0-1.073.041-1.58.122-.871.139-1.556.4-2.037.774-.461.359-.693.789-.693 1.282 0 .387.131.728.392 1.018.279.309.679.563 1.189.756.765.29 1.694.437 2.763.437h.02c.89 0 1.721-.058 2.471-.173.732-.112 1.401-.294 1.991-.542 1.185-.498 2.071-1.224 2.635-2.158.55-.911.827-1.983.827-3.193 0-1.858-.85-3.433-2.53-4.686C16.913.94 14.778.282 12.195.001h-.009zM13.5 11.5c-.276 0-.5-.224-.5-.5s.224-.5.5-.5.5.224.5.5-.224.5-.5.5z"/>
                </svg>
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
