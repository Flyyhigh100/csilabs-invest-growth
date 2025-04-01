
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

const Home: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`container mx-auto px-4 py-20 ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100">Welcome to CSi Labs</h1>
        <p className="text-lg mb-8 text-gray-700 dark:text-gray-300">Your trusted platform for secure token investments and financial innovation.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-gradient-to-r from-cbis-blue to-cbis-teal text-white hover:opacity-90 transition-opacity">
            <Link to="/login">Sign In</Link>
          </Button>
          
          <Button asChild variant="outline" className="border-cbis-blue text-cbis-blue hover:bg-cbis-blue/10 dark:border-cbis-teal dark:text-cbis-teal dark:hover:bg-cbis-teal/10">
            <Link to="/register">Create Account</Link>
          </Button>
          
          <Button asChild variant="ghost" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Link to="/token-info">Learn More</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
