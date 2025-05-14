
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FilePlus2, X } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelect(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          PDF Document
        </label>
        {selectedFile && (
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            onClick={handleClear}
            className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex-1"
        >
          <FilePlus2 className="mr-2 h-4 w-4" />
          {selectedFile ? 'Replace File' : 'Select PDF File'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
      
      {selectedFile && (
        <div className="text-sm text-gray-500 mt-2">
          Selected file: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
        </div>
      )}
    </div>
  );
};

export default FileUploader;
