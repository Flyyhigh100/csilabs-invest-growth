
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import FileUploader from './components/FileUploader';
import DocumentMetadataForm from './components/DocumentMetadataForm';
import SubmitButton from './components/SubmitButton';
import { DocumentFormValues } from './types/documentTypes';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface DocumentUploadFormProps {
  onDocumentUploaded: (file: File, values: DocumentFormValues) => Promise<boolean>;
  bucketExists: boolean; // Only checking for bucket existence
}

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  publishDate: z.string().min(1, "Publication date is required"),
  authors: z.string().optional(),
});

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({ 
  onDocumentUploaded,
  bucketExists
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileValidation, setFileValidation] = useState<{
    isValid: boolean;
    message: string | null;
  }>({ isValid: true, message: null });
  
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
    setUploadError(null);
    
    // Validate file
    if (!file) {
      setFileValidation({ isValid: false, message: "No file selected" });
      return;
    }
    
    // Check file size (10MB max)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      setFileValidation({ 
        isValid: false, 
        message: `File exceeds 10MB size limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)` 
      });
      return;
    }
    
    // Check file type
    if (!file.type.includes('pdf')) {
      setFileValidation({ isValid: false, message: "Only PDF files are supported" });
      return;
    }
    
    // File is valid
    setFileValidation({ isValid: true, message: "File is valid" });
    console.log("File selected:", file ? file.name : "No file selected");
  };

  const handleSubmit = async (values: DocumentFormValues) => {
    if (!bucketExists) {
      setUploadError("Storage bucket not found. Please create the bucket first.");
      toast.error("Storage bucket not found. Please create the bucket first.");
      return;
    }
    
    if (!selectedFile) {
      setUploadError("Please select a PDF file to upload");
      toast.error("Please select a PDF file to upload");
      return;
    }
    
    if (!fileValidation.isValid) {
      setUploadError(fileValidation.message || "Invalid file");
      toast.error(fileValidation.message || "Invalid file");
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    console.log("Starting file upload process...");
    
    try {
      const success = await onDocumentUploaded(selectedFile, values);
      
      if (success) {
        // Clear form
        form.reset();
        setSelectedFile(null);
        setFileValidation({ isValid: true, message: null });
        toast.success("Document uploaded successfully");
      } else {
        setUploadError("Failed to upload document");
        toast.error("Failed to upload document");
      }
    } catch (error: any) {
      console.error("Error uploading document:", error);
      setUploadError(error.message || "Unknown error occurred");
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Calculate if button should be disabled
  const isUploadDisabled = isUploading || !selectedFile || !fileValidation.isValid || !bucketExists;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload New Research Document</CardTitle>
        <CardDescription>
          Upload PDF documents and add metadata to display them on the research documents page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!bucketExists && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Storage Not Ready</AlertTitle>
            <AlertDescription>
              Storage bucket not found. Please create the bucket first using the controls above.
            </AlertDescription>
          </Alert>
        )}
        
        {uploadError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Upload Failed</AlertTitle>
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
        
        {fileValidation.message && !fileValidation.isValid && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>File Validation Error</AlertTitle>
            <AlertDescription>{fileValidation.message}</AlertDescription>
          </Alert>
        )}
        
        {fileValidation.message && fileValidation.isValid && selectedFile && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>File Ready for Upload</AlertTitle>
            <AlertDescription>
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <DocumentMetadataForm 
              form={form} 
              disabled={isUploading} 
            />
            
            <FileUploader 
              disabled={isUploading}
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
                  {!bucketExists ? "You must create the storage bucket first." : 
                   !selectedFile ? "Please select a file to upload." : 
                   !fileValidation.isValid ? fileValidation.message : ""}
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
