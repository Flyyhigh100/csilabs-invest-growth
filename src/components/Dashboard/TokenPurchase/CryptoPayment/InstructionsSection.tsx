
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InstructionsSectionProps {
  instructions: string;
}

const InstructionsSection: React.FC<InstructionsSectionProps> = ({ instructions }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Payment Instructions</h3>
      
      <div className="bg-white p-4 rounded border border-gray-200 text-sm">
        <p>{instructions}</p>
      </div>
      
      <Alert variant="warning" className="border-amber-200 bg-amber-50/50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          Do not send coins other than the specified currency. Doing so may result in permanent loss.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default InstructionsSection;
