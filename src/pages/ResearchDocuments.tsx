
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FadeInSection from '@/components/FadeInSection';
import DocumentsGrid from '@/components/ResearchDocuments/DocumentsGrid';
import DocumentViewer from '@/components/ResearchDocuments/DocumentViewer';
import CategoryFilter from '@/components/ResearchDocuments/CategoryFilter';
import { useResearchDocuments } from '@/hooks/research/useResearchDocuments';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { ExternalLink, Play } from 'lucide-react';

const ResearchDocuments: React.FC = () => {
  const {
    filteredDocuments,
    isLoading,
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedPdf,
    setSelectedPdf,
    refreshDocuments
  } = useResearchDocuments();

  const handleWatchVideo = () => {
    window.open('https://ai.invideo.io/watch/_3yp5v0y87T', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container-custom">
          <FadeInSection>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-cbis-dark">
                Award Winning <span className="bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent">Research Documentation</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">Explore CSi Labs' Harvard Award Winning peer-reviewed research reports and documentation, along with other studies supporting our low-cost cannabinoid-based cancer killing treatments.</p>
            </div>
          </FadeInSection>

          {/* Latest Research Update Video */}
          <FadeInSection>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Latest Research Update</h2>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md">
                  <div className="w-full h-full bg-gradient-to-br from-cbis-blue/10 to-cbis-teal/10 flex flex-col items-center justify-center border border-gray-200 rounded-md">
                    <div className="text-center p-8">
                      <div className="mb-4">
                        <Play className="h-16 w-16 mx-auto text-cbis-blue" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-cbis-dark">Latest Research Insights</h3>
                      <p className="text-gray-600 mb-4">Watch our most recent findings and research developments</p>
                      <Button 
                        onClick={handleWatchVideo}
                        className="bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 text-white"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Watch Video
                      </Button>
                    </div>
                  </div>
                </AspectRatio>
                <div className="mt-4 text-center">
                  <p className="text-gray-500 text-xs">Click the button above to view the video on InVideo</p>
                </div>
              </div>
            </div>
          </FadeInSection>

          {/* Featured Research Video */}
          <FadeInSection>
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Featured Research</h2>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md">
                  <iframe src="https://www.youtube.com/embed/x3q2uQ7J7f4" title="CSI Labs Research Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" className="w-full h-full border-0" allowFullScreen></iframe>
                </AspectRatio>
                <div className="mt-4 text-center">
                  <h3 className="font-medium text-lg">CSI Labs Research Overview</h3>
                  <p className="text-gray-600 text-sm">Explore our comprehensive research approach and latest findings</p>
                </div>
              </div>
            </div>
          </FadeInSection>

          <div className="mb-8 flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
            </div>
            <p className="text-sm text-gray-500">
              Showing {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
            </p>
          </div>

          <DocumentsGrid documents={filteredDocuments} isLoading={isLoading} onSelectDocument={setSelectedPdf} onRefresh={refreshDocuments} />
        </div>
      </div>

      <DocumentViewer document={selectedPdf} open={!!selectedPdf} onOpenChange={open => !open && setSelectedPdf(null)} />

      <Footer />
    </div>
  );
};

export default ResearchDocuments;
