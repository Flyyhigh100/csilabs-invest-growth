
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
          className="md:hidden text-cbis-dark p-2" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={cn(
          "fixed inset-0 bg-white bg-opacity-95 backdrop-blur-md z-40 md:hidden flex flex-col pt-20 px-6",
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
          to="/research-documents" 
          className="py-3 border-b border-gray-100 text-cbis-dark hover:text-cbis-blue"
          onClick={() => setIsOpen(false)}
        >
          Research
        </Link>
        <Link 
          to="/token-info" 
          className="py-3 border-b border-gray-100 text-cbis-dark hover:text-cbis-blue"
          onClick={() => setIsOpen(false)}
        >
          Token Info
        </Link>
        
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
            className="py-3 mt-4 text-center border-b border-gray-100 text-cbis-dark hover:text-cbis-blue"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
        ) : (
          <Link 
            to="/login" 
            className="py-3 mt-4 text-center border-b border-gray-100 flex items-center justify-center gap-2 text-cbis-dark hover:text-cbis-blue"
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
