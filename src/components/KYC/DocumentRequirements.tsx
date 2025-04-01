
import React from 'react';
import { AlertCircle } from 'lucide-react';

const DocumentRequirements: React.FC = () => {
  return (
    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
      <p><strong>Requirements:</strong></p>
      <ul className="list-disc list-inside mt-1 space-y-1">
        <li>Files must be clear, readable image formats (JPG, PNG)</li>
        <li>Maximum file size: 5MB per image</li>
        <li>For the selfie, hold your ID next to your face</li>
      </ul>
    </div>
  );
};

export default DocumentRequirements;
