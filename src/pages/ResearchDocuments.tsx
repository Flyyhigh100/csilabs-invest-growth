
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  ChevronLeft, 
  FileText, 
  Download, 
  Calendar, 
  FileQuestion,
  ExternalLink,
  Search,
  Bookmark,
  Book
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ResearchDocument {
  id: string;
  name: string;
  displayName: string;
  created_at: string;
  size: number;
  url: string;
}

const ResearchDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<ResearchDocument | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('research')
        .list();

      if (error) {
        console.error('Error fetching documents:', error);
        return;
      }

      if (data) {
        // Filter out any folders, only include files
        const files = data.filter(item => !item.id.endsWith('/') && item.name.endsWith('.pdf'));
        
        // Get the public URLs for each file
        const docsWithUrls = await Promise.all(files.map(async (file) => {
          const { data: urlData } = await supabase.storage
            .from('research')
            .getPublicUrl(file.name);
            
          // Create a more user-friendly display name by removing timestamp prefix
          const displayName = file.name.split('-').slice(1).join('-').replace('.pdf', '');
          
          return {
            id: file.id,
            name: file.name,
            displayName: displayName || 'Research Document',
            created_at: file.created_at,
            size: file.metadata?.size || 0,
            url: urlData?.publicUrl || '',
          };
        }));
        
        setDocuments(docsWithUrls);
        
        // If we have documents and none is selected, select the first one
        if (docsWithUrls.length > 0 && !selectedDocument) {
          setSelectedDocument(docsWithUrls[0]);
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract categories from document names
  const extractCategories = () => {
    const categories = new Set<string>();
    documents.forEach(doc => {
      const nameParts = doc.displayName.split('-');
      if (nameParts.length > 1) {
        categories.add(nameParts[0].trim());
      } else {
        categories.add('General');
      }
    });
    return Array.from(categories);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? doc.displayName.toLowerCase().startsWith(selectedCategory.toLowerCase()) : true;
    return matchesSearch && matchesCategory;
  });

  const categories = extractCategories();

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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Button 
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(null)}
                >
                  <Bookmark className="mr-2 h-4 w-4" />
                  All Categories
                </Button>
                
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <Bookmark className="mr-2 h-4 w-4" />
                    {category}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
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
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <FileQuestion className="h-16 w-16 text-gray-400 dark:text-gray-600" />
                  {searchTerm || selectedCategory ? (
                    <>
                      <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">No Matching Documents</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Try adjusting your search or filter criteria.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory(null);
                        }}
                      >
                        Clear Filters
                      </Button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">No Research Documents Available</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Our team is working on new research materials. Please check back soon.
                      </p>
                    </>
                  )}
                </div>
              </Card>
            ) : (
              <>
                <TabsContent value="grid" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredDocuments.map((doc) => {
                      const categoryMatch = doc.displayName.match(/^([^-]+)/);
                      const category = categoryMatch ? categoryMatch[0].trim() : "Research";
                      
                      return (
                        <Card key={doc.id} className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow border-2 hover:border-primary/20">
                          <CardHeader className="pb-2 border-b">
                            <div className="flex items-start justify-between">
                              <CardTitle className="line-clamp-2 text-lg" title={doc.displayName}>
                                {doc.displayName}
                              </CardTitle>
                              <Badge variant="outline" className="ml-2 flex-shrink-0">
                                {category}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="py-4 flex-grow">
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Published: {new Date(doc.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <FileText className="h-4 w-4 mr-1" />
                              <span>PDF • {(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                          </CardContent>
                          <CardFooter className="border-t bg-gray-50 dark:bg-gray-800/50 p-4">
                            <div className="flex gap-2 w-full">
                              <Button className="w-full flex items-center gap-2" asChild>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                  View Document
                                </a>
                              </Button>
                              <Button variant="outline" className="flex items-center gap-1" asChild>
                                <a href={doc.url} download={doc.displayName + ".pdf"}>
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
                
                <TabsContent value="table" className="mt-0">
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Published</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredDocuments.map((doc) => {
                            const categoryMatch = doc.displayName.match(/^([^-]+)/);
                            const category = categoryMatch ? categoryMatch[0].trim() : "Research";
                            
                            return (
                              <TableRow key={doc.id}>
                                <TableCell className="font-medium">{doc.displayName}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {category}
                                  </Badge>
                                </TableCell>
                                <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>{(doc.size / 1024 / 1024).toFixed(2)} MB</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      asChild
                                    >
                                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4 mr-1" />
                                        View
                                      </a>
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      asChild
                                    >
                                      <a href={doc.url} download={doc.displayName + ".pdf"}>
                                        <Download className="h-4 w-4" />
                                      </a>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ResearchDocuments;
