
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
        scrolled ? "py-2 bg-white bg-opacity-95 backdrop-blur-lg shadow-subtle" : "py-4 bg-transparent"
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
              <Link to="/register">Contribute Now</Link>
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
            isOpen ? "text-gray-800 bg-white" : "text-cbis-dark"
          )}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={cn(
          "fixed inset-0 bg-white z-40 md:hidden flex flex-col pt-20 px-6 shadow-lg transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="border-b border-gray-100 py-1">
          <Link 
            to="/" 
            className="block py-3 text-center text-gray-800 hover:text-cbis-blue hover:bg-gray-50 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
        </div>
        
        <div className="border-b border-gray-100 py-1">
          <Link 
            to="/research-documents" 
            className="block py-3 text-center text-gray-800 hover:text-cbis-blue hover:bg-gray-50 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            Research
          </Link>
        </div>
        
        <div className="border-b border-gray-100 py-1">
          <Link 
            to="/token-info" 
            className="block py-3 text-center text-gray-800 hover:text-cbis-blue hover:bg-gray-50 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            Token Info
          </Link>
        </div>
        
        <div className="mt-6">
          <Button 
            asChild
            className="w-full bg-gradient-to-r from-cbis-blue to-cbis-teal text-white"
            onClick={() => setIsOpen(false)}
          >
            {user ? (
              <Link to="/dashboard/payments">Contribute Now</Link>
            ) : (
              <Link to="/register">Contribute Now</Link>
            )}
          </Button>
        </div>
        
        {user ? (
          <Link 
            to="/dashboard/payments" 
            className="py-4 mt-4 text-center flex items-center justify-center gap-2 text-cbis-dark hover:text-cbis-blue hover:bg-gray-50 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
        ) : (
          <Link 
            to="/login" 
            className="py-4 mt-4 text-center flex items-center justify-center gap-2 text-cbis-dark hover:text-cbis-blue hover:bg-gray-50 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            <LogIn className="h-4 w-4" /> Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
