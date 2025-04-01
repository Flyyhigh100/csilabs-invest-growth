
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, Camera, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentUploadProps {
  documentType: 'id_front' | 'id_back' | 'selfie';
  title: string;
  isUploaded: boolean;
  isPending: boolean;
  onUpload: (file: File, type: 'id_front' | 'id_back' | 'selfie') => Promise<void>;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documentType,
  title,
  isUploaded,
  isPending,
  onUpload,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputId = `${documentType}-upload`;
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setUploadError(null);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Please upload an image file');
        toast.error('Please upload an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size exceeds 5MB limit');
        toast.error('File size exceeds 5MB limit');
        return;
      }
      
      try {
        console.log(`Uploading ${documentType} document:`, file.name);
        toast.info(`Uploading ${title.toLowerCase()}...`);
        await onUpload(file, documentType);
        console.log(`${documentType} upload completed successfully`);
      } catch (error) {
        console.error(`Error uploading ${documentType}:`, error);
        setUploadError('Upload failed. Please try again.');
      }
    }
  };
  
  const getIcon = () => {
    if (isUploaded) {
      return <CheckCircle className="h-8 w-8 text-green-500" />;
    }
    if (isPending && uploadedFile) {
      return <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />;
    }
    if (uploadError) {
      return <AlertCircle className="h-8 w-8 text-red-500" />;
    }
    return documentType === 'selfie' ? 
      <Camera className="h-8 w-8 text-gray-400" /> : 
      <Upload className="h-8 w-8 text-gray-400" />;
  };

  return (
    <div className="border rounded-md p-4">
      <h4 className="text-sm font-medium mb-2">{title}</h4>
      <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center mb-3">
        {isUploaded ? (
          <div className="p-2 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{title} Uploaded</p>
          </div>
        ) : isPending && uploadedFile ? (
          <div className="p-2 text-center">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : uploadError ? (
          <div className="p-2 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600">{uploadError}</p>
          </div>
        ) : (
          <div className="p-2 text-center">
            {getIcon()}
            <p className="text-sm text-gray-500 mt-2">
              {documentType === 'selfie' ? 'Take a clear picture with your ID' : 'Upload a clear image'}
            </p>
          </div>
        )}
      </div>
      <div className="relative">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full"
          disabled={isPending}
          onClick={() => document.getElementById(inputId)?.click()}
        >
          {isUploaded ? "Replace" : "Upload"}
        </Button>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          capture={documentType === 'selfie' ? 'user' : undefined}
        />
      </div>
    </div>
  );
};

export default DocumentUpload;
