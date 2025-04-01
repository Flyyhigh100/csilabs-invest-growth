
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useResearchDocuments } from '@/hooks/useResearchDocuments';
import SearchBar from '@/components/Research/SearchBar';
import CategoryFilter from '@/components/Research/CategoryFilter';
import DocumentGrid from '@/components/Research/DocumentGrid';
import DocumentTable from '@/components/Research/DocumentTable';

const ResearchDocuments: React.FC = () => {
  const { 
    filteredDocuments,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
    clearFilters
  } = useResearchDocuments();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Book className="h-8 w-8 text-primary" />
          Research Library
        </h1>
        <Button variant="outline" asChild>
          <Link to="/" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          Access our latest research documents and insights about our token and market trends.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Sidebar - Categories and Search */}
        <div className="lg:col-span-1 space-y-4">
          <SearchBar 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
          />
          
          <CategoryFilter 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </div>
        
        {/* Main Content Area */}
        <div className="lg:col-span-4">
          <Tabs defaultValue="grid" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="table">Table View</TabsTrigger>
              </TabsList>
              
              <p className="text-sm text-gray-500">
                {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'} found
              </p>
            </div>
            
            <TabsContent value="grid" className="mt-0">
              <DocumentGrid 
                documents={filteredDocuments}
                isLoading={isLoading}
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                onClearFilters={clearFilters}
              />
            </TabsContent>
            
            <TabsContent value="table" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-pulse flex space-x-4">
                    <div className="h-6 w-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <DocumentGrid 
                  documents={[]}
                  isLoading={false}
                  searchTerm={searchTerm}
                  selectedCategory={selectedCategory}
                  onClearFilters={clearFilters}
                />
              ) : (
                <DocumentTable documents={filteredDocuments} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ResearchDocuments;
