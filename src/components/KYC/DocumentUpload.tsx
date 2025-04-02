
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, Camera, Loader2 } from 'lucide-react';

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
  const inputId = `${documentType}-upload`;
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      await onUpload(file, documentType);
    }
  };
  
  const getIcon = () => {
    if (isUploaded) {
      return <CheckCircle className="h-8 w-8 text-green-500" />;
    }
    if (isPending && uploadedFile) {
      return <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />;
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
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
        ) : (
          getIcon()
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
        />
      </div>
    </div>
  );
};

export default DocumentUpload;
