
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X, ChevronDown, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  // Handle scroll events to update navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "py-2 bg-white bg-opacity-80 backdrop-blur-lg shadow-subtle" : "py-4 bg-transparent"
      )}
    >
      <div className="container-custom flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent">CSi Labs</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-800 hover:text-cbis-blue transition-colors">Home</Link>
          <Link to="/research-documents" className="text-gray-800 hover:text-cbis-blue transition-colors">Research</Link>
          <Link to="/token-info" className="text-gray-800 hover:text-cbis-blue transition-colors">Token Info</Link>
          
          <Button asChild className="bg-gradient-to-r from-cbis-blue to-cbis-teal text-white hover:opacity-90 transition-opacity">
            {user ? (
              <Link to="/dashboard/payments">Contribute Now</Link>
            ) : (
              <Link to="/signup">Contribute Now</Link>
            )}
          </Button>
          
          {user ? (
            <Button asChild size="sm" variant="ghost" className="text-gray-800 hover:text-cbis-blue transition-colors">
              <Link to="/dashboard/payments">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="ghost" className="text-gray-800 hover:text-cbis-blue flex items-center gap-1 transition-colors">
              <Link to="/login">
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={cn(
            "md:hidden p-2 rounded-md transition-colors z-50",
            isOpen ? "text-gray-800" : "text-cbis-dark"
          )}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation - Fixed overlay with solid white background */}
      <div 
        className={cn(
          "fixed inset-0 bg-white z-40 md:hidden flex flex-col",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ height: '100vh' }}
      >
        {/* Menu header with logo */}
        <div className="border-b border-gray-100 p-4 bg-white">
          <Link 
            to="/" 
            className="flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-xl font-bold bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent">
              CSi Labs
            </span>
          </Link>
        </div>
        
        {/* Menu content with solid background */}
        <div className="flex-1 overflow-auto bg-white pt-6">
          <div className="border-b border-gray-100 py-1">
            <Link 
              to="/" 
              className="block py-3 px-6 text-center text-gray-800 hover:text-cbis-blue hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          </div>
          
          <div className="border-b border-gray-100 py-1">
            <Link 
              to="/research-documents" 
              className="block py-3 px-6 text-center text-gray-800 hover:text-cbis-blue hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Research
            </Link>
          </div>
          
          <div className="border-b border-gray-100 py-1">
            <Link 
              to="/token-info" 
              className="block py-3 px-6 text-center text-gray-800 hover:text-cbis-blue hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Token Info
            </Link>
          </div>
        </div>
        
        {/* Bottom action buttons with solid background */}
        <div className="p-6 border-t border-gray-100 bg-white">
          <Button 
            asChild
            className="w-full mb-3 bg-gradient-to-r from-cbis-blue to-cbis-teal text-white"
            onClick={() => setIsOpen(false)}
          >
            {user ? (
              <Link to="/dashboard/payments">Contribute Now</Link>
            ) : (
              <Link to="/signup">Contribute Now</Link>
            )}
          </Button>
          
          {user ? (
            <Link 
              to="/dashboard/payments" 
              className="py-3 w-full flex items-center justify-center gap-2 text-cbis-dark hover:text-cbis-blue hover:bg-gray-50 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="py-3 w-full flex items-center justify-center gap-2 text-cbis-dark hover:text-cbis-blue hover:bg-gray-50 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <LogIn className="h-4 w-4" /> Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
