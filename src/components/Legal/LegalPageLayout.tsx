
import React, { useEffect, ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Container } from '@/components/ui/container';
import { useLocation } from 'react-router-dom';

interface LegalPageLayoutProps {
  children: ReactNode;
  title: string;
}

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ children, title }) => {
  const location = useLocation();

  useEffect(() => {
    // Function to handle scrolling with an offset for the navbar
    const scrollToContent = () => {
      // If there's a hash in the URL, scroll to that element
      if (location.hash) {
        // Remove the # character to get the ID
        const id = location.hash.substring(1);
        
        // Find the element with the matching ID
        const element = document.getElementById(id);
        
        if (element) {
          // Get the navbar height - adjust this value as needed based on your navbar
          const navbarHeight = 80; // Approximate navbar height
          
          // Calculate the position to scroll to (element position - navbar height)
          const offsetPosition = element.getBoundingClientRect().top + 
            window.pageYOffset - navbarHeight;
          
          // Scroll to the position with smooth behavior
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      } else {
        // If no hash, scroll to the top with an offset for the navbar
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    };

    // Scroll after a small timeout to ensure the DOM is fully loaded
    const timeoutId = setTimeout(scrollToContent, 100);
    
    return () => clearTimeout(timeoutId);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6" id="top">{title}</h1>
            {children}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default LegalPageLayout;
