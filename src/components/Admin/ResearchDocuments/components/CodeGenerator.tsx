import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { ResearchDocument } from '../types/documentTypes';

interface CodeGeneratorProps {
  documents: ResearchDocument[];
}

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ documents }) => {
  const downloadResearchDocumentsCode = () => {
    // Generate the updated code with the current documents array
    const documentsArrayString = documents
      .map(doc => {
        return `  {
    id: "${doc.id}",
    title: "${doc.title}",
    description: "${doc.description}",
    category: "${doc.category}",
    pdfUrl: "${doc.pdfUrl}",
    publishDate: "${doc.publishDate}"${doc.authors ? `,\n    authors: "${doc.authors}"` : ''}
  }`;
      })
      .join(',\n');
    
    const code = `import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FadeInSection from '@/components/FadeInSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileText, Download, ExternalLink, ChevronDown, Info } from 'lucide-react';

interface ResearchDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  pdfUrl: string;
  publishDate: string;
  authors?: string;
}

// This is where you can add or modify your research documents.
// To add a new document:
// 1. Upload the PDF to the /public folder
// 2. Add a new entry to this array using the format below
// For external documents, use complete URLs starting with http:// or https://
const researchDocuments: ResearchDocument[] = [
${documentsArrayString}
];

// The rest of the component remains the same
const ResearchDocuments: React.FC = () => {
  const [selectedPdf, setSelectedPdf] = useState<ResearchDocument | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(researchDocuments.map(doc => doc.category)));
  
  const filteredDocuments = selectedCategory 
    ? researchDocuments.filter(doc => doc.category === selectedCategory) 
    : researchDocuments;

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
              Showing {filteredDocuments.length} of {researchDocuments.length} documents
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredDocuments.map((document) => (
              <FadeInSection key={document.id} className="h-full">
                <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="bg-blue-50 text-cbis-blue text-xs font-medium px-2.5 py-1 rounded">
                        {document.category}
                      </div>
                      <span className="text-xs text-gray-500">{document.publishDate}</span>
                    </div>
                    <CardTitle className="mt-2 text-xl">{document.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col">
                    <p className="text-gray-600 mb-6 text-sm flex-grow">
                      {document.description}
                    </p>
                    {document.authors && (
                      <p className="text-xs text-gray-500 mb-4">
                        <span className="font-medium">Authors:</span> {document.authors}
                      </p>
                    )}
                    <div className="flex gap-2 mt-auto">
                      <Button 
                        variant="default" 
                        className="flex-grow bg-gradient-to-r from-cbis-blue to-cbis-teal text-white hover:opacity-90"
                        onClick={() => setSelectedPdf(document)}
                      >
                        <FileText className="mr-2 h-4 w-4" /> View Document
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </FadeInSection>
            ))}
          </div>
          
          <FadeInSection>
            <Card className="mb-16">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6 items-center">
                  <div className="flex items-center justify-center p-6 bg-blue-50 rounded-lg">
                    <Info className="h-12 w-12 text-cbis-blue" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold mb-2 text-cbis-dark">Request Additional Research</h3>
                    <p className="text-gray-600 mb-4">
                      Interested in learning more about our research? Contact our team to request access to additional studies and documentation.
                    </p>
                    <Button className="bg-gradient-to-r from-cbis-blue to-cbis-teal text-white hover:opacity-90">
                      Contact Research Team
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeInSection>
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
`;

    // Create a download link
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ResearchDocuments.tsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Code file generated and downloaded. Replace the existing src/pages/ResearchDocuments.tsx with this file.");
  };

  return (
    <Button 
      onClick={downloadResearchDocumentsCode} 
      variant="default"
      className="bg-cbis-blue hover:bg-cbis-blue/90"
    >
      <Download className="mr-2 h-4 w-4" />
      Generate Code File
    </Button>
  );
};

export default CodeGenerator;
