
import React from 'react';
import { Button } from '@/components/ui/button';
import { FilePlus2, RefreshCw } from 'lucide-react';

interface SubmitButtonProps {
  isUploading: boolean;
  disabled: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isUploading, disabled }) => {
  return (
    <Button 
      type="submit" 
      className="w-full sm:w-auto bg-cbis-blue hover:bg-cbis-blue/90"
      disabled={disabled}
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
  );
};

export default SubmitButton;
