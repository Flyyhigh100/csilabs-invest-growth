
import React from 'react';
import { toast } from 'sonner';

interface FileUploadValidatorProps {
  allowedTypes: string[];
  maxSize: number; // in bytes
  onValidFile: (file: File) => void;
  children: React.ReactNode;
}

export const FileUploadValidator: React.FC<FileUploadValidatorProps> = ({
  allowedTypes,
  maxSize,
  onValidFile,
  children
}) => {
  const validateFile = (file: File): boolean => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      return false;
    }

    // Check file size
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      return false;
    }

    // Check file name for suspicious patterns
    const suspiciousPatterns = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    if (suspiciousPatterns.some(pattern => file.name.toLowerCase().includes(pattern))) {
      toast.error('Invalid file type detected');
      return false;
    }

    // Validate file extension matches MIME type
    const extension = file.name.split('.').pop()?.toLowerCase();
    const expectedMimeTypes: Record<string, string[]> = {
      'jpg': ['image/jpeg'],
      'jpeg': ['image/jpeg'],
      'png': ['image/png'],
      'pdf': ['application/pdf'],
      'doc': ['application/msword'],
      'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    if (extension && expectedMimeTypes[extension]) {
      if (!expectedMimeTypes[extension].includes(file.type)) {
        toast.error('File extension does not match file content');
        return false;
      }
    }

    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      onValidFile(file);
    }
    // Clear input to allow same file selection again
    event.target.value = '';
  };

  return (
    <div onClick={() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = allowedTypes.join(',');
      input.onchange = handleFileChange;
      input.click();
    }}>
      {children}
    </div>
  );
};

export default FileUploadValidator;
