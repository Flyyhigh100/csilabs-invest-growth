
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import FileUploader from './components/FileUploader';
import DocumentMetadataForm from './components/DocumentMetadataForm';
import SubmitButton from './components/SubmitButton';
import { ResearchDocument, DocumentFormValues } from './types/documentTypes';

interface DocumentUploadFormProps {
  bucketName: string;
  onDocumentUploaded: (newDocument: ResearchDocument) => void;
  isAuthenticated: boolean;
}

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  publishDate: z.string().min(1, "Publication date is required"),
  authors: z.string().optional(),
});

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({ 
  bucketName, 
  onDocumentUploaded,
  isAuthenticated
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      publishDate: new Date().toISOString().split('T')[0],
      authors: "",
    },
  });

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    console.log("File selected:", file ? file.name : "No file selected");
  };

  const handleSubmit = async (values: DocumentFormValues) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to upload documents");
      return;
    }
    
    if (!selectedFile) {
      toast.error("Please select a PDF file to upload");
      return;
    }
    
    setIsUploading(true);
    console.log("Starting file upload process...");
    
    try {
      // Check if user is authenticated before proceeding
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("You must be logged in to upload documents");
        setIsUploading(false);
        return;
      }
      
      // 1. Create a file name with metadata
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${values.title.replace(/\s+/g, '_')}.${fileExt}`;
      
      console.log(`Uploading to bucket: ${bucketName}, filename: ${fileName}`);
      
      // 2. Upload file - using metadata field instead of customMetadata
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, selectedFile, {
          contentType: `application/${fileExt}`,
          upsert: true,
          cacheControl: '3600',
          // Store metadata as a searchParam in the file name instead
          // This is a workaround since customMetadata is not available in the type
        });
      
      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw uploadError;
      }
      
      console.log("Upload successful, getting public URL");
      
      // 3. Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      const publicUrl = publicUrlData.publicUrl;
      console.log("Generated public URL:", publicUrl);
      
      // 4. Store metadata separately in a searchParam or query string
      const metadataParams = new URLSearchParams();
      metadataParams.append('title', values.title);
      metadataParams.append('description', values.description);
      metadataParams.append('category', values.category);
      metadataParams.append('publishDate', values.publishDate);
      if (values.authors) metadataParams.append('authors', values.authors);
      
      // Alternative approach: store metadata in Supabase database
      // This would be a better approach but requires SQL changes
      // For now we'll use the URL with search params
      
      // 5. Create the new document object
      const newDocument: ResearchDocument = {
        id: `doc-${Date.now()}`,
        title: values.title,
        description: values.description,
        category: values.category,
        pdfUrl: publicUrl,
        publishDate: values.publishDate,
        authors: values.authors,
      };
      
      // 6. Add to state via parent callback
      onDocumentUploaded(newDocument);
      
      // 7. Clear form
      form.reset();
      setSelectedFile(null);
      
      // 8. Clear localStorage cache so the main page will reload from storage
      localStorage.removeItem('researchDocuments');
      
      // 9. Show success message
      toast.success("Document uploaded successfully");
      
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Calculate if button should be disabled
  const isUploadDisabled = !isAuthenticated || isUploading || !selectedFile;

  return (
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
            <DocumentMetadataForm 
              form={form} 
              disabled={!isAuthenticated || isUploading} 
            />
            
            <FileUploader 
              disabled={!isAuthenticated || isUploading}
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
            />

            <div className="pt-4">
              <SubmitButton 
                isUploading={isUploading}
                disabled={isUploadDisabled}
              />
              
              {isUploadDisabled && (
                <p className="text-xs text-gray-500 mt-2">
                  {!isAuthenticated ? "You must be logged in to upload documents." : 
                   !selectedFile ? "Please select a file to upload." : ""}
                </p>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DocumentUploadForm;
