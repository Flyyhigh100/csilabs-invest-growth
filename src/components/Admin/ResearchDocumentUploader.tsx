
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Check, AlertTriangle, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ResearchDocument {
  id: string;
  name: string;
  created_at: string;
  size: number;
  url: string;
}

const ResearchDocumentUploader: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('research')
        .list();

      if (error) {
        console.error('Error fetching documents:', error);
        toast.error('Failed to load research documents');
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
            
          return {
            id: file.id,
            name: file.name,
            created_at: file.created_at,
            size: file.metadata?.size || 0,
            url: urlData?.publicUrl || '',
          };
        }));
        
        setDocuments(docsWithUrls);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An error occurred while loading documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      setSelectedFile(file);
      setUploadSuccess(false);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate a unique file name to avoid conflicts
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}-${selectedFile.name.replace(/\s+/g, '-')}`;

      // Simulate progress updates manually since onUploadProgress isn't supported
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          return newProgress > 90 ? 90 : newProgress; // Cap at 90% until upload is confirmed
        });
      }, 300);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('research')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);

      if (error) {
        console.error('Upload error:', error);
        toast.error('Upload failed: ' + error.message);
        return;
      }

      // Set to 100% when upload is confirmed successful
      setUploadProgress(100);

      // Create a public URL for the research PDF
      const { data: publicUrlData } = await supabase.storage
        .from('research')
        .getPublicUrl(fileName);

      if (publicUrlData) {
        console.log('File uploaded successfully:', publicUrlData.publicUrl);
        setUploadSuccess(true);
        toast.success('Research document uploaded successfully!');
        setSelectedFile(null);
        fetchDocuments(); // Refresh the document list
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    setIsDeleting(true);
    try {
      console.log('Deleting document:', documentToDelete);
      
      // Fixed: Use the correct endpoint for deletion and handle errors properly
      const { error } = await supabase.storage
        .from('research')
        .remove([documentToDelete]);

      if (error) {
        console.error('Error deleting document:', error);
        toast.error('Failed to delete document: ' + error.message);
        return;
      }

      // Success! Update UI and show success message
      toast.success('Document deleted successfully');
      
      // Refresh the document list after successful deletion
      await fetchDocuments();
    } catch (error) {
      console.error('Unexpected error during deletion:', error);
      toast.error('An unexpected error occurred while deleting the document');
    } finally {
      setIsDeleting(false);
      setDocumentToDelete(null);
    }
  };

  const confirmDelete = (documentName: string) => {
    console.log('Setting document to delete:', documentName);
    setDocumentToDelete(documentName);
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Upload Research Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${selectedFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <Check className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Click to select a PDF file</p>
                  <p className="text-xs text-gray-500">or drag and drop</p>
                </div>
              )}
              <input 
                id="file-upload" 
                type="file" 
                accept="application/pdf" 
                className="hidden" 
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>

            {uploadSuccess && (
              <div className="bg-green-50 p-3 rounded-md flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">Upload Complete</p>
                  <p className="text-xs text-green-600">The research document has been successfully uploaded.</p>
                </div>
              </div>
            )}

            {isUploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <p className="text-xs text-gray-500 mt-1 text-right">{uploadProgress}% uploaded</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={uploadFile}
            disabled={!selectedFile || isUploading}
            className="w-full"
          >
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </CardFooter>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Research Documents Library</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-4 text-gray-500">Loading documents...</p>
          ) : documents.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No research documents uploaded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name.split('-').slice(1).join('-')}</TableCell>
                    <TableCell>{(doc.size / 1024 / 1024).toFixed(2)} MB</TableCell>
                    <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          View
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => confirmDelete(doc.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog 
        open={!!documentToDelete} 
        onOpenChange={(open) => {
          if (!open) setDocumentToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the research document from the storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteDocument}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ResearchDocumentUploader;
