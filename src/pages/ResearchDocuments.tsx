import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FadeInSection from '@/components/FadeInSection';
import DocumentsGrid from '@/components/ResearchDocuments/DocumentsGrid';
import DocumentViewer from '@/components/ResearchDocuments/DocumentViewer';
import CategoryFilter from '@/components/ResearchDocuments/CategoryFilter';
import { useResearchDocuments } from '@/hooks/research/useResearchDocuments';
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

  // This was causing an infinite loop - removed the call to refreshDocuments from here
  // The useResearchDocuments hook already fetches documents on mount

  return <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container-custom">
          <FadeInSection>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-cbis-dark">
                Research <span className="bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent">Documentation</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">Explore CSi Labs' research documents and other studies supporting our cannabinoid-based cancer treatments.</p>
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
    </div>;
};
export default ResearchDocuments;