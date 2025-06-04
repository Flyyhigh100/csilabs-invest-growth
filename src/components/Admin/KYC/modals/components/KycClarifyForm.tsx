
import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, Loader2 } from 'lucide-react';
import { showSmartNotification } from '@/utils/notification/smartNotifications';

interface KycClarifyFormProps {
  clarificationMessage: string;
  setClarificationMessage: (message: string) => void;
  onRequestClarification: () => void;
  isPending: boolean;
}

const KycClarifyForm: React.FC<KycClarifyFormProps> = ({
  clarificationMessage,
  setClarificationMessage,
  onRequestClarification,
  isPending
}) => {
  const handleClarifyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!clarificationMessage || !clarificationMessage.trim()) {
      showSmartNotification(
        'Error', 
        'Please provide clarification details',
        { type: 'kyc_action', priority: 'high' }
      );
      return;
    }
    
    if (isPending) {
      showSmartNotification(
        'Info', 
        'Already processing your request, please wait',
        { type: 'kyc_action', priority: 'medium' }
      );
      return;
    }
    
    console.log('Triggering clarification request with message:', clarificationMessage);
    onRequestClarification();
  };

  return (
    <div className="mb-4 border-t pt-4">
      <div className="flex items-start gap-2 mb-2">
        <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5" />
        <h4 className="font-medium text-blue-800">Request Clarification</h4>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Clarification Details (required)
        </label>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
          rows={3}
          value={clarificationMessage}
          onChange={(e) => setClarificationMessage(e.target.value)}
          placeholder="What additional information do you need from the user?"
          disabled={isPending}
          maxLength={500}
        />
      </div>
      
      <div className="flex justify-end mt-3">
        <Button 
          variant="default"
          onClick={handleClarifyClick}
          disabled={isPending || !clarificationMessage.trim()}
          type="button"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Request Clarification"
          )}
        </Button>
      </div>
    </div>
  );
};

export default KycClarifyForm;
