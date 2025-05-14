
import React, { useCallback } from 'react';
import { Upload, AlertCircle, Check } from 'lucide-react';

interface FileUploaderProps {
  disabled: boolean;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  disabled, 
  onFileSelect, 
  selectedFile 
}) => {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
    console.log("File selected:", file);
  }, [onFileSelect]);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onFileSelect(file);
      console.log("File dropped:", file);
    }
  }, [disabled, onFileSelect]);
  
  const isValidFileType = selectedFile && selectedFile.type.includes('pdf');
  const fileSize = selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0;
  const isValidFileSize = selectedFile ? selectedFile.size <= 10 * 1024 * 1024 : true; // 10MB max

  return (
    <div 
      className={`border border-dashed rounded-md p-6 
        ${disabled ? 'opacity-60' : 'cursor-pointer'} 
        ${selectedFile ? (isValidFileType && isValidFileSize ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50') : ''}
      `}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-4">
        <label 
          htmlFor="file-upload" 
          className={`cursor-pointer flex items-center justify-center w-full h-full ${disabled ? 'pointer-events-none' : ''}`}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            {selectedFile ? (
              <>
                {isValidFileType && isValidFileSize ? (
                  <Check className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-500" />
                )}
              </>
            ) : (
              <Upload className="h-8 w-8 text-gray-400" />
            )}
            
            <div className="font-medium">
              {selectedFile ? selectedFile.name : 'Select PDF file'}
            </div>
            
            <p className="text-xs text-gray-500">
              {selectedFile 
                ? `${fileSize} MB ${!isValidFileSize ? '(exceeds 10MB limit)' : ''} ${!isValidFileType ? '(not a PDF file)' : ''}` 
                : 'Click to browse or drag and drop PDF file here (max 10MB)'}
            </p>
            
            {selectedFile && !isValidFileType && (
              <p className="text-xs text-red-500 mt-1">Only PDF files are supported</p>
            )}
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </label>
      </div>
    </div>
  );
};

export default FileUploader;
