
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FadeInSection from '@/components/FadeInSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileText, Download, ExternalLink, ChevronDown, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ResearchDocument } from '@/components/Admin/ResearchDocuments/types/documentTypes';

// Default/fallback documents in case storage loading fails
const fallbackDocuments: ResearchDocument[] = [
  {
    id: "doc-1",
    title: "Cannabinoids as Antioxidants and Neuroprotectants",
    description: "US Patent #6,630,507 details cannabinoids as potent antioxidants with neuroprotective properties, potentially useful for treating oxidative stress-related diseases.",
    category: "Patents",
    pdfUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3f/US-PatentTrademarkOffice-Patent6630507.pdf",
    publishDate: "October 7, 2003",
    authors: "Hampson et al., US Department of Health and Human Services"
  },
  {
    id: "doc-2",
    title: "Cannabis and Cannabinoid Research in Cancer",
    description: "Comprehensive research on the effects of cannabinoids on various cancer cell types and mechanisms of action.",
    category: "Clinical Research",
    pdfUrl: "/sample.pdf",
    publishDate: "March 15, 2022",
    authors: "CSi Labs Research Team"
  }
];

const ResearchDocuments: React.FC = () => {
  const [selectedPdf, setSelectedPdf] = useState<ResearchDocument | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch documents from Supabase storage
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        // First, try to load from local storage (cache)
        const cachedDocs = localStorage.getItem('researchDocuments');
        if (cachedDocs) {
          setDocuments(JSON.parse(cachedDocs));
        }
        
        // Fetch the list of files from the storage bucket
        const { data: files, error: filesError } = await supabase
          .storage
          .from('research_documents')
          .list();
          
        if (filesError) {
          console.error('Error fetching files:', filesError);
          if (!cachedDocs) {
            // If no cache and error, use fallback
            setDocuments(fallbackDocuments);
          }
          throw new Error(filesError.message);
        }

        if (!files || files.length === 0) {
          console.log('No files found in storage, using fallback documents');
          setDocuments(fallbackDocuments);
          setIsLoading(false);
          return;
        }

        // Get metadata for each file
        const filePromises = files.map(async (file) => {
          // The filename should contain metadata in format: title__category__date__authors.pdf
          // If not properly formatted, extract what we can
          const fileName = file.name;
          
          // Get the public URL
          const { data: urlData } = supabase
            .storage
            .from('research_documents')
            .getPublicUrl(fileName);
            
          // Try to extract metadata from filename or use defaults
          let title = "Untitled Research Document";
          let category = "Research";
          let publishDate = new Date().toLocaleDateString();
          let authors = "";
          let description = "";
          
          // If the file has metadata in the name (from the admin upload)
          if (file.metadata && typeof file.metadata === 'object') {
            const meta = file.metadata as any;
            title = meta.title || title;
            category = meta.category || category;
            publishDate = meta.publishDate || publishDate;
            authors = meta.authors || authors;
            description = meta.description || description;
          }
          
          return {
            id: `doc-${fileName}`,
            title,
            description: description || `${title} - Research document`,
            category,
            pdfUrl: urlData.publicUrl,
            publishDate,
            authors
          } as ResearchDocument;
        });

        const documentsList = await Promise.all(filePromises);
        
        // Combine with fallback documents to ensure we always have some content
        const combinedDocs = [...documentsList, ...fallbackDocuments];
        
        // Cache the results
        localStorage.setItem('researchDocuments', JSON.stringify(combinedDocs));
        
        setDocuments(combinedDocs);
      } catch (err: any) {
        console.error('Error loading documents:', err);
        setError(err.message);
        
        // If we haven't set documents yet, use fallbacks
        if (documents.length === 0) {
          setDocuments(fallbackDocuments);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const categories = Array.from(new Set(documents.map(doc => doc.category)));
  
  const filteredDocuments = selectedCategory 
    ? documents.filter(doc => doc.category === selectedCategory) 
    : documents;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container-custom">
          <FadeInSection>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-cbis-dark">
                Research <span className="bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent">Documentation</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Explore CSi Labs' research documents, patents, and clinical studies supporting our cannabinoid-based cancer treatments.
              </p>
            </div>
          </FadeInSection>

          <div className="mb-8 flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    {selectedCategory || "All Categories"}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0">
                  <div className="p-1">
                    <Button 
                      variant={!selectedCategory ? "default" : "ghost"}
                      className="w-full justify-start mb-1"
                      onClick={() => setSelectedCategory(null)}
                    >
                      All Categories
                    </Button>
                    {categories.map(category => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "ghost"}
                        className="w-full justify-start mb-1"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <p className="text-sm text-gray-500">
              Showing {filteredDocuments.length} of {documents.length} documents
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-cbis-blue" />
              <p className="ml-2 text-gray-600">Loading research documents...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((document) => (
                  <FadeInSection key={document.id} className="h-full">
                    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="bg-blue-50 text-cbis-blue text-xs font-medium px-2.5 py-1 rounded">
                            {document.category}
                          </div>
                          <span className="text-xs text-gray-500">{document.publishDate}</span>
                        </div>
                        <CardTitle className="mt-3 text-xl leading-tight">{document.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow flex flex-col pt-2">
                        <p className="text-gray-600 mb-6 text-sm flex-grow">
                          {document.description}
                        </p>
                        {document.authors && (
                          <p className="text-xs text-gray-500 mb-4">
                            <span className="font-medium">Authors:</span> {document.authors}
                          </p>
                        )}
                        <Button 
                          variant="default" 
                          className="w-full mt-auto bg-gradient-to-r from-cbis-blue to-cbis-teal text-white hover:opacity-90"
                          onClick={() => setSelectedPdf(document)}
                        >
                          <FileText className="mr-2 h-4 w-4" /> View Document
                        </Button>
                      </CardContent>
                    </Card>
                  </FadeInSection>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700">No documents found</h3>
                  <p className="text-gray-500 mt-2">There are no research documents in this category.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer Dialog */}
      <Dialog open={!!selectedPdf} onOpenChange={(open) => !open && setSelectedPdf(null)}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedPdf?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-grow h-[70vh]">
            <iframe 
              src={selectedPdf?.pdfUrl} 
              className="w-full h-full border-0 rounded"
              title={selectedPdf?.title}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => window.open(selectedPdf?.pdfUrl, '_blank')}>
              <ExternalLink className="mr-2 h-4 w-4" /> Open in New Tab
            </Button>
            <Button className="bg-gradient-to-r from-cbis-blue to-cbis-teal" onClick={() => window.open(selectedPdf?.pdfUrl, '_blank')}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ResearchDocuments;
