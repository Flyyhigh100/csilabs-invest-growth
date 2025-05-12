
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { CheckCircle, Wallet, DollarSign, ArrowRightCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface PurchaseStepsAccordionProps {
  activeSection: 'wallet' | 'funding' | 'purchase';
  sectionsCompleted: {
    wallet: boolean;
    funding: boolean;
    purchase: boolean;
  };
  onSectionChange: (section: 'wallet' | 'funding' | 'purchase') => void;
  children: {
    wallet: React.ReactNode;
    funding: React.ReactNode;
    purchase: React.ReactNode;
  };
}

const PurchaseStepsAccordion: React.FC<PurchaseStepsAccordionProps> = ({
  activeSection,
  sectionsCompleted,
  onSectionChange,
  children
}) => {
  const isMobile = useIsMobile();
  
  const handleValueChange = (value: string) => {
    if (value === 'wallet' || value === 'funding' || value === 'purchase') {
      onSectionChange(value);
    }
  };

  return (
    <Accordion
      type="single"
      defaultValue={activeSection}
      value={activeSection}
      onValueChange={handleValueChange}
      className="w-full space-y-4"
      collapsible
    >
      <AccordionItem value="wallet" className="border-none">
        <Card className={cn(
          "transition-all overflow-hidden",
          sectionsCompleted.wallet ? "border-green-300" : "border-blue-200"
        )}>
          <div className={cn(
            "h-2",
            sectionsCompleted.wallet 
              ? "bg-gradient-to-r from-green-400 to-green-500" 
              : "bg-gradient-to-r from-cbis-blue to-cbis-teal"
          )}></div>
          
          <AccordionTrigger className={cn(
            "px-5 py-3 hover:no-underline",
            isMobile && "flex-col items-start gap-2"
          )}>
            <div className={cn(
              "flex items-center gap-3",
              isMobile && "w-full"
            )}>
              <div className={cn(
                "p-2 rounded-full flex items-center justify-center",
                sectionsCompleted.wallet 
                  ? "bg-green-100 text-green-600" 
                  : "bg-blue-100 text-cbis-blue"
              )}>
                {sectionsCompleted.wallet ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Wallet className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-medium text-left">Step 1: Connect Your Wallet</h3>
                <p className="text-sm text-gray-500 text-left">
                  {sectionsCompleted.wallet ? 
                    "Wallet successfully connected" : 
                    "Enter your wallet address or create a new one"}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          
          <AccordionContent className={cn(
            "px-3 md:px-5 pb-4",
          )}>
            {children.wallet}
          </AccordionContent>
        </Card>
      </AccordionItem>
      
      <AccordionItem value="funding" className="border-none">
        <Card className={cn(
          "transition-all overflow-hidden",
          sectionsCompleted.funding ? "border-green-300" : 
          sectionsCompleted.wallet ? "border-blue-200" : "border-gray-200 opacity-80"
        )}>
          <div className={cn(
            "h-2",
            sectionsCompleted.funding 
              ? "bg-gradient-to-r from-green-400 to-green-500" 
              : sectionsCompleted.wallet 
                ? "bg-gradient-to-r from-blue-400 to-blue-500"
                : "bg-gradient-to-r from-gray-300 to-gray-400"
          )}></div>
          
          <AccordionTrigger className={cn(
            "px-5 py-3 hover:no-underline",
            isMobile && "flex-col items-start gap-2"
          )}>
            <div className={cn(
              "flex items-center gap-3",
              isMobile && "w-full"
            )}>
              <div className={cn(
                "p-2 rounded-full flex items-center justify-center",
                sectionsCompleted.funding 
                  ? "bg-green-100 text-green-600" 
                  : sectionsCompleted.wallet
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-500"
              )}>
                {sectionsCompleted.funding ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <DollarSign className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-medium text-left">Step 2: Fund Your Wallet</h3>
                <p className="text-sm text-gray-500 text-left">
                  {sectionsCompleted.funding ? 
                    "Wallet funding completed" : 
                    "Add cryptocurrency to your wallet"}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          
          <AccordionContent className={cn(
            "px-3 md:px-5 pb-4",
          )}>
            {children.funding}
          </AccordionContent>
        </Card>
      </AccordionItem>
      
      <AccordionItem value="purchase" className="border-none">
        <Card className={cn(
          "transition-all overflow-hidden",
          sectionsCompleted.purchase ? "border-green-300" : 
          sectionsCompleted.funding ? "border-blue-200" : "border-gray-200 opacity-80"
        )}>
          <div className={cn(
            "h-2",
            sectionsCompleted.purchase 
              ? "bg-gradient-to-r from-green-400 to-green-500" 
              : sectionsCompleted.funding 
                ? "bg-gradient-to-r from-blue-400 to-blue-500"
                : "bg-gradient-to-r from-gray-300 to-gray-400"
          )}></div>
          
          <AccordionTrigger className={cn(
            "px-5 py-3 hover:no-underline",
            isMobile && "flex-col items-start gap-2"
          )}>
            <div className={cn(
              "flex items-center gap-3",
              isMobile && "w-full"
            )}>
              <div className={cn(
                "p-2 rounded-full flex items-center justify-center",
                sectionsCompleted.purchase 
                  ? "bg-green-100 text-green-600" 
                  : sectionsCompleted.funding
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-500"
              )}>
                {sectionsCompleted.purchase ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <ArrowRightCircle className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-medium text-left">Step 3: Purchase CSi Tokens</h3>
                <p className="text-sm text-gray-500 text-left">
                  {sectionsCompleted.purchase ? 
                    "Token purchase completed" : 
                    "Choose payment method and complete purchase"}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          
          <AccordionContent className={cn(
            "px-3 md:px-5 pb-4",
          )}>
            {children.purchase}
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );
};

export default PurchaseStepsAccordion;
