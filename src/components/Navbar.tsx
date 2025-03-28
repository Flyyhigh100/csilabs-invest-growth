
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          <Link to="/token-info" className="text-gray-800 hover:text-cbis-blue transition-colors">Token Info</Link>
          <Link to="/register" className="text-gray-800 hover:text-cbis-blue transition-colors">Register</Link>
          <Link to="/dashboard" className="text-gray-800 hover:text-cbis-blue transition-colors">Dashboard</Link>
          <Button asChild className="bg-gradient-to-r from-cbis-blue to-cbis-teal text-white hover:opacity-90 transition-opacity">
            <Link to="/register">Buy Tokens</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-cbis-dark p-2" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={cn(
          "fixed inset-0 bg-white bg-opacity-95 backdrop-blur-md z-40 transition-all duration-300 md:hidden flex flex-col pt-20 px-6",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <Link 
          to="/" 
          className="py-3 border-b border-gray-100 text-cbis-dark hover:text-cbis-blue"
          onClick={() => setIsOpen(false)}
        >
          Home
        </Link>
        <Link 
          to="/token-info" 
          className="py-3 border-b border-gray-100 text-cbis-dark hover:text-cbis-blue"
          onClick={() => setIsOpen(false)}
        >
          Token Info
        </Link>
        <Link 
          to="/register" 
          className="py-3 border-b border-gray-100 text-cbis-dark hover:text-cbis-blue"
          onClick={() => setIsOpen(false)}
        >
          Register
        </Link>
        <Link 
          to="/dashboard" 
          className="py-3 border-b border-gray-100 text-cbis-dark hover:text-cbis-blue"
          onClick={() => setIsOpen(false)}
        >
          Dashboard
        </Link>
        <div className="mt-6">
          <Button 
            asChild
            className="w-full bg-gradient-to-r from-cbis-blue to-cbis-teal text-white"
            onClick={() => setIsOpen(false)}
          >
            <Link to="/register">Buy Tokens</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
