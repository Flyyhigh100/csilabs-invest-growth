
import React from 'react';
import { CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, CreditCard } from 'lucide-react';

const TestModeFooter: React.FC = () => {
  return (
    <CardFooter className="bg-gray-50 p-4 border-t border-gray-200">
      <Alert className="w-full bg-blue-50 text-blue-800 border-blue-200">
        <div className="flex items-start">
          <Info className="h-5 w-5 mr-2 mt-0.5" />
          <div>
            <AlertTitle className="font-medium">Test Mode Active</AlertTitle>
            <AlertDescription className="mt-1">
              <p>For testing, use the following Stripe test card:</p>
              <div className="flex items-center mt-2 p-2 bg-white rounded border border-blue-200">
                <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                <code className="font-mono bg-gray-100 px-2 py-0.5 rounded">4242 4242 4242 4242</code>
                <span className="mx-2">•</span>
                <span>Any future date</span>
                <span className="mx-2">•</span>
                <span>Any 3 digits CVC</span>
                <span className="mx-2">•</span>
                <span>Any postal code</span>
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </CardFooter>
  );
};

export default TestModeFooter;
