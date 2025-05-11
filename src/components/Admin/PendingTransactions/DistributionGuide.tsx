
import React, { useState } from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, ChevronDown, ChevronUp, ExternalLink, FileText, Download } from 'lucide-react';

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
              {/* Reference Document Download */}
              <div className="mb-6 bg-blue-50 rounded-lg p-4">
                <div className="flex items-start mb-3">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                  <div>
                    <h4 className="font-medium text-blue-800">Reference Document</h4>
                    <p className="text-sm text-blue-700">Download the full process guide for detailed instructions</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                  asChild
                >
                  <a href="/Manual Order Process.docx" download>
                    <Download className="h-4 w-4" />
                    <span>Manual Order Process.docx</span>
                  </a>
                </Button>
              </div>

              <div>
                <h4 className="font-medium mb-2">MultiSender Distribution Process</h4>
                <ol className="list-decimal ml-5 space-y-2">
                  <li>Login to the Admin Dashboard</li>
                  <li>Select Manage Token Distribution</li>
                  <li>Open the Main Order Log</li>
                  <li>Double check to determine if all orders are up to date</li>
                  <li>Download and open the CSV file with the pending distribution</li>
                  <li>Go to the appropriate MultiSender platform:
                    <ul className="list-disc ml-5 mt-1 mb-1">
                      <li>
                        <a 
                          href="https://classic.multisender.app/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 inline-flex"
                        >
                          MultiSender for Polygon <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                      <li>
                        <a 
                          href="https://solana.multisender.app/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 inline-flex"
                        >
                          MultiSender for Solana <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li>Connect your wallet</li>
                  <li>Select the CSI token for the token address and "No" to the token being deflationary</li>
                  <li>Upload or copy and paste the pending distribution from the spreadsheet and press "Continue"</li>
                  <li>Make sure the wallet addresses and token amounts are separated by a comma</li>
                  <li>Double check the addresses uploaded against the addresses in the pending distribution spreadsheet</li>
                  <li>Check for errors and duplication before signing on the blockchain</li>
                  <li>Take a screenshot before signing</li>
                  <li>Sign</li>
                  <li>Check the blockchain to ensure that the transaction is verified:
                    <ul className="list-disc ml-5 mt-1 mb-1">
                      <li>
                        <a 
                          href="https://polygonscan.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 inline-flex"
                        >
                          Polygonscan for Polygon <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                      <li>
                        <a 
                          href="https://solscan.io/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 inline-flex"
                        >
                          Solscan for Solana <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li>Update the Main Order Log</li>
                  <li>Mark the orders as sent in the Admin Portal</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Downloading Distributions</h4>
                <p className="text-sm mb-2">
                  Use the "Download CSV" button to export transactions in a format compatible with the MultiSender tools.
                  The simplified format contains just wallet addresses and token amounts, separated by commas, ready to paste into MultiSender.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Recording Completed Distributions</h4>
                <ol className="list-decimal ml-5 space-y-2">
                  <li>After verifying the transaction on the blockchain, copy the transaction hash (TX ID)</li>
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
                  <li>Support for both Polygon and Solana networks</li>
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
