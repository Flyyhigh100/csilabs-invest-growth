
import React, { useState } from 'react';
import { Upload } from 'lucide-react';

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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
    console.log("File selected:", file);
  };

  return (
    <div className={`border border-dashed rounded-md p-6 ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-4">
        <label 
          htmlFor="file-upload" 
          className={`cursor-pointer flex items-center justify-center w-full h-full ${disabled ? 'pointer-events-none' : ''}`}
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
            disabled={disabled}
          />
        </label>
      </div>
    </div>
  );
};

export default FileUploader;
