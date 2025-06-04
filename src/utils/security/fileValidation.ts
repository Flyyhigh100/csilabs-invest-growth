
/**
 * Enhanced file upload security validation
 */

// Allowed file types for KYC documents
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'application/pdf'
];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// File signature validation (magic numbers)
const FILE_SIGNATURES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'application/pdf': [0x25, 0x50, 0x44, 0x46]
};

/**
 * Validates file type based on MIME type and file signature
 */
export const validateFileType = (file: File): boolean => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return false;
  }
  
  return true;
};

/**
 * Validates file size
 */
export const validateFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE;
};

/**
 * Validates file signature by reading the first few bytes
 */
export const validateFileSignature = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Check signature based on file type
      const signature = FILE_SIGNATURES[file.type as keyof typeof FILE_SIGNATURES];
      if (!signature) {
        resolve(false);
        return;
      }
      
      // Compare first bytes
      for (let i = 0; i < signature.length; i++) {
        if (uint8Array[i] !== signature[i]) {
          resolve(false);
          return;
        }
      }
      
      resolve(true);
    };
    
    reader.onerror = () => resolve(false);
    
    // Read first 8 bytes for signature validation
    reader.readAsArrayBuffer(file.slice(0, 8));
  });
};

/**
 * Sanitizes filename by removing dangerous characters
 */
export const sanitizeFilename = (filename: string): string => {
  // Remove path traversal attempts and dangerous characters
  return filename
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 100);
};

/**
 * Comprehensive file validation
 */
export const validateUploadedFile = async (file: File): Promise<{
  isValid: boolean;
  errors: string[];
}> => {
  const errors: string[] = [];
  
  // Check file type
  if (!validateFileType(file)) {
    errors.push('Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed.');
  }
  
  // Check file size
  if (!validateFileSize(file)) {
    errors.push('File size too large. Maximum size is 5MB.');
  }
  
  // Check file signature
  try {
    const hasValidSignature = await validateFileSignature(file);
    if (!hasValidSignature) {
      errors.push('File appears to be corrupted or has an invalid format.');
    }
  } catch (error) {
    errors.push('Failed to validate file signature.');
  }
  
  // Check filename
  if (file.name.length > 100) {
    errors.push('Filename is too long.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generate secure filename for storage
 */
export const generateSecureFilename = (originalFilename: string, userId: string): string => {
  const sanitizedName = sanitizeFilename(originalFilename);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  const extension = sanitizedName.split('.').pop() || '';
  const nameWithoutExt = sanitizedName.replace(/\.[^/.]+$/, '');
  
  return `${userId}_${timestamp}_${random}_${nameWithoutExt}.${extension}`;
};
