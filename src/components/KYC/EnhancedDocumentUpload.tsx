
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import FileUploadValidator from '@/components/Security/FileUploadValidator';
import { useCSRF } from '@/components/Security/CSRFProtection';

interface EnhancedDocumentUploadProps {
  onUpload: (file: File, type: string) => Promise<void>;
  uploadedUrl?: string;
  isUploading?: boolean;
  label: string;
  documentType: string;
  accept?: string;
}

const EnhancedDocumentUpload: React.FC<EnhancedDocumentUploadProps> = ({
  onUpload,
  uploadedUrl,
  isUploading,
  label,
  documentType,
  accept = "image/*,.pdf"
}) => {
  const { withCSRF } = useCSRF();
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(uploadedUrl || null);

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf'
  ];

  const maxSize = 10 * 1024 * 1024; // 10MB

  const handleValidFile = useCallback(async (file: File) => {
    try {
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }

      // Add CSRF protection to upload
      await onUpload(file, documentType);
      
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
      setPreviewUrl(null);
    }
  }, [onUpload, documentType]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      // Validate through our secure validator
      const file = files[0];
      handleValidFile(file);
    }
  }, [handleValidFile]);

  const removeFile = () => {
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>
      
      {!previewUrl ? (
        <FileUploadValidator
          allowedTypes={allowedTypes}
          maxSize={maxSize}
          onValidFile={handleValidFile}
        >
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, PDF up to 10MB
                </p>
              </div>
            )}
          </div>
        </FileUploadValidator>
      ) : (
        <div className="relative border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Document uploaded
                </p>
                <p className="text-xs text-gray-500">
                  Ready for verification
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-gray-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {previewUrl && previewUrl.startsWith('data:image') && (
            <div className="mt-4">
              <img
                src={previewUrl}
                alt="Document preview"
                className="max-w-full h-32 object-contain rounded"
              />
            </div>
          )}
        </div>
      )}

      <div className="flex items-start space-x-2 text-xs text-gray-500">
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Security Notice:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Only upload official government-issued documents</li>
            <li>Ensure all text is clearly visible and readable</li>
            <li>Do not upload edited or modified documents</li>
            <li>Files are securely encrypted during upload and storage</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDocumentUpload;
