
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface EnhancedPurchaseGuideProps {
  currentStep: number;
}

const EnhancedPurchaseGuide: React.FC<EnhancedPurchaseGuideProps> = ({ currentStep }) => {
  const steps = [
    { id: 1, title: "Set up your wallet", description: "Create a crypto wallet to receive tokens" },
    { id: 2, title: "Fund your wallet", description: "Add cryptocurrency to your wallet" },
    { id: 3, title: "Purchase CSi tokens", description: "Exchange your crypto for CSi tokens" }
  ];

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-4">Token Purchase Process</h3>
      <div className="space-y-2">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className={`flex items-start p-2 rounded-md ${currentStep >= step.id ? 'bg-white border border-blue-200' : 'bg-transparent'}`}
          >
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              currentStep > step.id 
                ? 'bg-green-100 text-green-600' 
                : currentStep === step.id 
                  ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-600' 
                  : 'bg-gray-100 text-gray-400'
            } mr-3`}>
              {currentStep > step.id ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <span className="text-xs font-medium">{step.id}</span>
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                currentStep >= step.id ? 'text-gray-800' : 'text-gray-500'
              }`}>{step.title}</p>
              <p className={`text-xs ${
                currentStep >= step.id ? 'text-gray-600' : 'text-gray-400'
              }`}>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedPurchaseGuide;
