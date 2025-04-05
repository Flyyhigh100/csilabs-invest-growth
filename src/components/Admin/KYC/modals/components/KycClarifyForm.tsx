
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';

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
  return (
    <div className="mb-4 border-t pt-4">
      <div className="flex items-start gap-2 mb-2">
        <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
        <h4 className="font-medium text-blue-800">Request Additional Information</h4>
      </div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Request Details (required)
      </label>
      <textarea
        className="w-full p-2 border border-gray-300 rounded-md"
        rows={3}
        value={clarificationMessage}
        onChange={(e) => setClarificationMessage(e.target.value)}
        placeholder="Specify what additional information you need from the user..."
        disabled={isPending}
      />
      <div className="flex justify-end mt-3">
        <Button 
          onClick={onRequestClarification}
          disabled={isPending || !clarificationMessage.trim()}
          className="bg-blue-600 hover:bg-blue-700"
          type="button"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Send Request"
          )}
        </Button>
      </div>
    </div>
  );
};

export default KycClarifyForm;
