
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FilePlus2, Upload, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DocumentUploadFormProps {
  bucketExists: boolean;
  bucketName: string;
  onDocumentUploaded: (newDocument: ResearchDocument) => void;
}

export interface ResearchDocument {
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

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({ 
  bucketExists, 
  bucketName, 
  onDocumentUploaded 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
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

  // Reset the form when bucket status changes (necessary for re-enabling form after bucket creation)
  useEffect(() => {
    if (bucketExists) {
      form.reset(form.getValues());
    }
  }, [bucketExists, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    console.log("File selected:", file);
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedFile) {
      toast.error("Please select a PDF file to upload");
      return;
    }
    
    if (!bucketExists) {
      toast.error(`Storage bucket '${bucketName}' not available`);
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
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter document title" {...field} disabled={!bucketExists || isUploading} />
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
                      disabled={!bucketExists || isUploading}
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
                      <Input placeholder="e.g. Clinical Research, Patents" {...field} disabled={!bucketExists || isUploading} />
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
                      <Input type="date" {...field} disabled={!bucketExists || isUploading} />
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
                    <Input placeholder="e.g. CSi Labs Research Team" {...field} disabled={!bucketExists || isUploading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className={`border border-dashed rounded-md p-6 ${!bucketExists ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-4">
                <label 
                  htmlFor="file-upload" 
                  className={`cursor-pointer flex items-center justify-center w-full h-full ${!bucketExists ? 'pointer-events-none' : ''}`}
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
  );
};

export default DocumentUploadForm;
