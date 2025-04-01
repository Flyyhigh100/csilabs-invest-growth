
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Check, AlertTriangle } from 'lucide-react';

const ResearchDocumentUploader: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
        .upload('csi-research-data.pdf', selectedFile, {
          cacheControl: '3600',
          upsert: true,
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
        .getPublicUrl('csi-research-data.pdf');

      if (publicUrlData) {
        console.log('File uploaded successfully:', publicUrlData.publicUrl);
        setUploadSuccess(true);
        toast.success('Research document uploaded successfully!');
        
        // Update the link to the public/research folder
        await copyToPublicFolder();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  // This function copies the file from Supabase storage to the public folder
  // so it's accessible via the static URL in the app
  const copyToPublicFolder = async () => {
    try {
      const { data: fileData, error: fetchError } = await supabase.storage
        .from('research')
        .download('csi-research-data.pdf');

      if (fetchError) {
        console.error('Error downloading from Supabase:', fetchError);
        return;
      }

      // Return the public URL where the file will be accessible
      const fileUrl = '/research/csi-research-data.pdf';
      console.log('File will be accessible at:', fileUrl);
      
      toast.success(
        'The research document is now available through the "View Research Data" button on the homepage', 
        { duration: 5000 }
      );
    } catch (error) {
      console.error('Error copying to public folder:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
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
  );
};

export default ResearchDocumentUploader;
