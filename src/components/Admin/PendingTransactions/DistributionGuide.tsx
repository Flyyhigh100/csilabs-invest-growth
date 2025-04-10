
import React, { useState } from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const DistributionGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen}
      className="mb-6"
    >
      <Card>
        <CollapsibleTrigger asChild>
          <div className="flex justify-between items-center p-4 cursor-pointer">
            <div className="flex items-center gap-2 text-primary">
              <HelpCircle className="h-5 w-5" />
              <h3 className="text-lg font-medium">Distribution Guide</h3>
            </div>
            {isOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Using the Simplified CSV with Cryptosender.io</h4>
                <ol className="list-decimal ml-5 space-y-2">
                  <li>Download the Simplified CSV format from the "Download CSV" button</li>
                  <li>Go to <a href="https://cryptosender.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 inline-flex">Cryptosender.io <ExternalLink className="h-3 w-3" /></a></li>
                  <li>Connect your wallet that holds the tokens for distribution</li>
                  <li>Select "Bulk Distribution" and upload the CSV file</li>
                  <li>Complete the transaction and wait for confirmation</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Recording Completed Distributions</h4>
                <ol className="list-decimal ml-5 space-y-2">
                  <li>After completing the distribution, copy the transaction hash (TX ID)</li>
                  <li>Return to this page and select the transactions you've sent tokens for</li>
                  <li>Click "Mark Selected as Sent" and paste the transaction hash</li>
                  <li>Submit to update all selected distributions</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Benefits of Bulk Distribution</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Save on gas fees by combining multiple transfers</li>
                  <li>Improve efficiency by handling multiple distributions at once</li>
                  <li>Reduce the risk of errors with automated processes</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Resources for New Users</h4>
                <ul className="list-disc ml-5 space-y-2">
                  <li>
                    <a 
                      href="https://phantom.com/learn/guides/how-to-create-a-new-wallet" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      How to create a new wallet <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://cagechain.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      Learn more at Cagechain.com <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default DistributionGuide;
