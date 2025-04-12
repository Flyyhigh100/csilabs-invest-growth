
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ChevronLeft, Search, FileQuestion } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Extract the path for a more user-friendly message
  const path = location.pathname.slice(1) || "home";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="container-custom py-16 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-400 mb-6">
              <FileQuestion className="h-10 w-10" />
            </div>
            
            <h1 className="text-4xl font-bold mb-2 text-gray-900">Page Not Found</h1>
            <p className="text-xl text-gray-600 mb-4">Error 404</p>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <p className="text-gray-500 mb-4">
                Sorry, we couldn't find the <span className="font-medium text-gray-700">"{path}"</span> page you were looking for.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="default" className="bg-cbis-blue hover:bg-cbis-blue/90">
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
                
                <Button asChild variant="outline">
                  <Link to="/research-documents">
                    <Search className="mr-2 h-4 w-4" />
                    Research Documents
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Link to="/" className="inline-flex items-center text-cbis-blue hover:underline">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Return to the homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotFound;
