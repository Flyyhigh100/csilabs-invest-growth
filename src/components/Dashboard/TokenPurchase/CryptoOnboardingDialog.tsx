
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, Wallet, ArrowRight } from 'lucide-react';

interface CryptoOnboardingDialogProps {
  onComplete: (isNewUser: boolean) => void;
}

const CryptoOnboardingDialog: React.FC<CryptoOnboardingDialogProps> = ({ onComplete }) => {
  const [open, setOpen] = useState(false);
  
  // Check if user has seen the onboarding dialog before
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('cryptoOnboardingComplete');
    if (!hasSeenOnboarding) {
      setOpen(true);
    } else {
      // If onboarding is already complete, notify parent component
      onComplete(localStorage.getItem('cryptoExperienceLevel') === 'new');
    }
  }, [onComplete]);
  
  const handleUserResponse = (isNewUser: boolean) => {
    localStorage.setItem('cryptoOnboardingComplete', 'true');
    localStorage.setItem('cryptoExperienceLevel', isNewUser ? 'new' : 'experienced');
    setOpen(false);
    onComplete(isNewUser);
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      // If the dialog is closed without selecting an option, default to experienced
      if (!isOpen && !localStorage.getItem('cryptoOnboardingComplete')) {
        handleUserResponse(false);
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-cbis-blue" />
            Welcome to CSi Tokens
          </DialogTitle>
          <DialogDescription>
            To help provide the best experience, please tell us about your familiarity with cryptocurrency.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="bg-blue-50 p-4 rounded-lg text-blue-800">
            <p className="text-sm">
              Your response helps us personalize your token purchasing experience.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button 
            onClick={() => handleUserResponse(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-cbis-blue to-cbis-teal"
          >
            <Wallet className="mr-2 h-4 w-4" />
            I'm new to crypto
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleUserResponse(false)}
            className="w-full sm:w-auto"
          >
            I'm experienced with crypto
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CryptoOnboardingDialog;
