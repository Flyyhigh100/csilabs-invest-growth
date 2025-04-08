
import React from 'react';

interface InstructionsSectionProps {
  instructions: string;
}

const InstructionsSection: React.FC<InstructionsSectionProps> = ({ instructions }) => {
  return (
    <div>
      <h3 className="font-medium mb-3">Instructions</h3>
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <ol className="list-decimal pl-5 space-y-2 text-sm text-blue-800">
          {instructions.split('\n').map((instruction, index) => (
            instruction.trim() ? <li key={index}>{instruction}</li> : null
          ))}
        </ol>
      </div>
    </div>
  );
};

export default InstructionsSection;
