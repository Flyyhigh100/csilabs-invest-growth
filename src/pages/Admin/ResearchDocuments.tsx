import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { FilePlus2, Upload, Trash2, FileText, RefreshCw, Download } from 'lucide-react';
import AdminLayout from '@/components/Admin/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { checkBucketExists } from '@/utils/admin/kyc/storage';

interface ResearchDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  pdfUrl: string;
  publishDate: string;
  authors?: string;
}

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  publishDate: z.string().min(1, "Publication date is required"),
  authors: z.string().optional(),
});

const AdminResearchDocuments = () => {
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bucketExists, setBucketExists] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      publishDate: new Date().toISOString().split('T')[0],
      authors: "",
    },
  });
  
  useEffect(() => {
    checkResearchBucket();
    loadDocumentsFromFile();
  }, []);

  async function checkResearchBucket() {
    const exists = await checkBucketExists('research_documents');
    setBucketExists(exists);
    console.log('Research documents bucket exists:', exists);
    
    if (!exists) {
      toast.error("Storage bucket not configured. Contact your administrator.");
    }
  }
  
  async function loadDocumentsFromFile() {
    setIsLoading(true);
    try {
      // Fetch the ResearchDocuments.tsx file content
      const response = await fetch('/src/pages/ResearchDocuments.tsx');
      const fileContent = await response.text();
      
      // Extract the documents array using regex
      const docsMatch = fileContent.match(/const\s+researchDocuments\s*=\s*\[([\s\S]*?)\];/);
      
      if (docsMatch && docsMatch[1]) {
        // Create a temporary function to evaluate the array
        // This is hacky but works for simple JSON-like structures
        const docs = eval(`[${docsMatch[1]}]`);
        setDocuments(docs);
      } else {
        toast.error("Could not parse research documents from file");
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      toast.error("Failed to load research documents");
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };
  
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedFile) {
      toast.error("Please select a PDF file to upload");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // 1. Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('research_documents')
        .upload(fileName, selectedFile);
      
      if (uploadError) throw uploadError;
      
      // 2. Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('research_documents')
        .getPublicUrl(fileName);
      
      const publicUrl = publicUrlData.publicUrl;
      
      // 3. Create the new document object
      const newDocument: ResearchDocument = {
        id: `doc-${Date.now()}`,
        title: values.title,
        description: values.description,
        category: values.category,
        pdfUrl: publicUrl,
        publishDate: values.publishDate,
        authors: values.authors,
      };
      
      // 4. Add to state
      setDocuments([...documents, newDocument]);
      
      // 5. Clear form
      form.reset();
      setSelectedFile(null);
      
      // 6. Show success message
      toast.success("Document uploaded successfully");
      
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

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
    <AdminLayout title="Manage Research Documents">
      <div className="grid gap-6">
        {!bucketExists && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <p className="text-amber-800">
                Storage bucket 'research_documents' not found. Please create it in Supabase to enable file uploads.
              </p>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Upload New Research Document</CardTitle>
            <CardDescription>
              Upload PDF documents and add metadata to display them on the research documents page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter document title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter a brief description of the document" 
                          className="resize-none min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Clinical Research, Patents" {...field} />
                        </FormControl>
                        <FormDescription>
                          Documents are grouped by category
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="publishDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publication Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="authors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authors (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. CSi Labs Research Team" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="border border-dashed rounded-md p-6">
                  <div className="flex items-center gap-4">
                    <label 
                      htmlFor="file-upload" 
                      className="cursor-pointer flex items-center justify-center w-full h-full"
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Upload className={`${selectedFile ? 'text-green-500' : 'text-gray-400'} h-8 w-8`} />
                        <div className="font-medium">
                          {selectedFile ? selectedFile.name : 'Select PDF file'}
                        </div>
                        <p className="text-xs text-gray-500">
                          {selectedFile 
                            ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` 
                            : 'Click to browse or drag and drop'}
                        </p>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        disabled={!bucketExists || isUploading}
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto bg-cbis-blue hover:bg-cbis-blue/90"
                    disabled={!bucketExists || isUploading || !selectedFile}
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FilePlus2 className="mr-2 h-4 w-4" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Research Documents</CardTitle>
            <CardDescription>
              Manage the documents that appear on the research page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No research documents found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-medium">{doc.title}</h3>
                          <p className="text-sm text-gray-500">{doc.category} • {doc.publishDate}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(doc.pdfUrl, '_blank')}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button onClick={loadDocumentsFromFile} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload
            </Button>
            <Button 
              onClick={downloadResearchDocumentsCode} 
              variant="default"
              className="bg-cbis-blue hover:bg-cbis-blue/90"
            >
              <Download className="mr-2 h-4 w-4" />
              Generate Code File
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminResearchDocuments;
