
import React from 'react';
import { CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from 'lucide-react';

const TestModeFooter: React.FC = () => {
  return (
    <CardFooter className="bg-gray-50 p-4 border-t border-gray-200">
      <Alert className="w-full bg-blue-50 text-blue-800 border-blue-200">
        <Info className="h-5 w-5" />
        <AlertTitle>Test Mode Active</AlertTitle>
        <AlertDescription>
          For testing, use Stripe test card: 4242 4242 4242 4242, any future date, any 3 digits CVC, and any postal code.
        </AlertDescription>
      </Alert>
    </CardFooter>
  );
};

export default TestModeFooter;
