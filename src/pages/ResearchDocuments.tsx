
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FadeInSection from '@/components/FadeInSection';
import DocumentsGrid from '@/components/ResearchDocuments/DocumentsGrid';
import DocumentViewer from '@/components/ResearchDocuments/DocumentViewer';
import CategoryFilter from '@/components/ResearchDocuments/CategoryFilter';
import { useResearchDocuments } from '@/hooks/research/useResearchDocuments';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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
                  <wistia-player media-id="mbfp6iuabu" aspect="1.7777777777777777"></wistia-player>
                </AspectRatio>
                <div className="mt-4 text-center">
                  <h3 className="font-medium text-lg">Latest Research Insights</h3>
                  <p className="text-gray-600 text-sm">Our most recent findings and research developments</p>
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
