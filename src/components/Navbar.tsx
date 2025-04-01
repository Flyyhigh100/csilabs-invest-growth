
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X, LogIn, UserPlus, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
        scrolled 
          ? `py-2 ${theme === 'dark' ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-lg shadow-subtle` 
          : `py-4 ${theme === 'dark' ? 'bg-transparent' : 'bg-transparent'}`
      )}
    >
      <div className="container-custom flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent">CSi Labs</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-gray-800 dark:text-gray-200 hover:text-cbis-blue dark:hover:text-cbis-teal transition-colors">Home</Link>
          <Link to="/token-info" className="text-gray-800 dark:text-gray-200 hover:text-cbis-blue dark:hover:text-cbis-teal transition-colors">Token Info</Link>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          {user ? (
            <Button asChild className="bg-gradient-to-r from-cbis-blue to-cbis-teal text-white hover:opacity-90 transition-opacity">
              <Link to="/dashboard/payments">Buy Tokens</Link>
            </Button>
          ) : (
            <>
              <Link to="/login" className="text-gray-800 dark:text-gray-200 hover:text-cbis-blue dark:hover:text-cbis-teal transition-colors flex items-center">
                <LogIn className="mr-1 h-4 w-4" />
                Sign In
              </Link>
              <Button asChild className="bg-gradient-to-r from-cbis-blue to-cbis-teal text-white hover:opacity-90 transition-opacity">
                <Link to="/register" className="flex items-center">
                  <UserPlus className="mr-1 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <button 
            className="text-gray-800 dark:text-gray-200 p-2" 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={cn(
          "fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-95 dark:bg-opacity-95 backdrop-blur-md z-40 md:hidden flex flex-col pt-20 px-6 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <Link 
          to="/" 
          className="py-3 border-b border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:text-cbis-blue dark:hover:text-cbis-teal"
          onClick={() => setIsOpen(false)}
        >
          Home
        </Link>
        <Link 
          to="/token-info" 
          className="py-3 border-b border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:text-cbis-blue dark:hover:text-cbis-teal"
          onClick={() => setIsOpen(false)}
        >
          Token Info
        </Link>
        
        {user ? (
          <Link 
            to="/dashboard/payments" 
            className="py-3 border-b border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:text-cbis-blue dark:hover:text-cbis-teal"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link 
              to="/login" 
              className="py-3 border-b border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:text-cbis-blue dark:hover:text-cbis-teal flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <LogIn className="mr-1 h-4 w-4" />
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="py-3 border-b border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:text-cbis-blue dark:hover:text-cbis-teal flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <UserPlus className="mr-1 h-4 w-4" />
              Sign Up
            </Link>
          </>
        )}
        
        {user && (
          <div className="mt-6">
            <Button 
              asChild
              className="w-full bg-gradient-to-r from-cbis-blue to-cbis-teal text-white"
              onClick={() => setIsOpen(false)}
            >
              <Link to="/dashboard/payments">Buy Tokens</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
