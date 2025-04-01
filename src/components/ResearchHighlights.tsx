
import React from 'react';
import { FadeInSection } from '@/components/FadeInSection';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';

export default function ResearchHighlights() {
  const navigate = useNavigate();

  return (
    <FadeInSection>
      <div className="bg-slate-50 dark:bg-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">Research</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight">
              Backed by thorough research
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500 dark:text-gray-400">
              Our token is built on well-researched market dynamics and innovative technological solutions.
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="pt-6">
              <div className="flow-root bg-white dark:bg-gray-800 rounded-lg px-6 pb-8 shadow-md h-full flex flex-col">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-indigo-500 dark:bg-indigo-600 rounded-md shadow-lg">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Market Analysis</h3>
                  <div className="mt-2 text-base text-gray-500 dark:text-gray-400 flex-grow">
                    Comprehensive analysis of market trends and competitive landscape in the cryptocurrency space.
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-6">
              <div className="flow-root bg-white dark:bg-gray-800 rounded-lg px-6 pb-8 shadow-md h-full flex flex-col">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-indigo-500 dark:bg-indigo-600 rounded-md shadow-lg">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Technical Innovation</h3>
                  <div className="mt-2 text-base text-gray-500 dark:text-gray-400 flex-grow">
                    Detailed documentation on the technical aspects and innovations behind our token.
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-6">
              <div className="flow-root bg-white dark:bg-gray-800 rounded-lg px-6 pb-8 shadow-md h-full flex flex-col">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-indigo-500 dark:bg-indigo-600 rounded-md shadow-lg">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Future Outlook</h3>
                  <div className="mt-2 text-base text-gray-500 dark:text-gray-400 flex-grow">
                    Projections and roadmap for the future development and adoption of our token technology.
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 flex justify-center">
            <Button 
              className="flex items-center gap-2 text-md" 
              size="lg" 
              onClick={() => navigate('/research')}
            >
              <FileText className="h-5 w-5" />
              View Research Documents
            </Button>
          </div>
        </div>
      </div>
    </FadeInSection>
  );
}
