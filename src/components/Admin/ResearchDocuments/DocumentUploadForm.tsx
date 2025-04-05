
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
      
      // 1. Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      console.log(`Uploading to bucket: ${bucketName}, filename: ${fileName}`);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, selectedFile);
      
      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw uploadError;
      }
      
      console.log("Upload successful, getting public URL");
      
      // 2. Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      const publicUrl = publicUrlData.publicUrl;
      console.log("Generated public URL:", publicUrl);
      
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
      
      // 4. Add to state via parent callback
      onDocumentUploaded(newDocument);
      
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
