
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { IPNLog } from './types';

interface IPNLogDetailsSheetProps {
  log: IPNLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const IPNLogDetailsSheet: React.FC<IPNLogDetailsSheetProps> = ({ log, open, onOpenChange }) => {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy HH:mm:ss');
    } catch (e) {
      return dateStr;
    }
  };

  if (!log) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[90%] sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>IPN Log Details</SheetTitle>
          <SheetDescription>
            Detailed information from IPN notification
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-2">General Info</h4>
            <div className="rounded-md border p-3 text-sm space-y-2">
              <p><span className="font-medium">Provider:</span> {log.provider}</p>
              <p><span className="font-medium">Date:</span> {formatDate(log.created_at)}</p>
              <p><span className="font-medium">Transaction ID:</span> {log.txn_id || 'N/A'}</p>
              <p><span className="font-medium">Status:</span> {log.status || 'N/A'}</p>
              <p>
                <span className="font-medium">Verification:</span>{' '}
                {log.verification_status || 'Unknown'}
              </p>
              <p>
                <span className="font-medium">Valid Signature:</span>{' '}
                {log.is_valid ? (
                  <CheckCircle className="h-4 w-4 text-green-500 inline" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 inline" />
                )}
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Payload Data</h4>
            <pre className="rounded-md bg-gray-100 p-3 overflow-x-auto text-xs">
              {JSON.stringify(log.raw_data, null, 2)}
            </pre>
          </div>
          
          {log.hmac_header && (
            <div>
              <h4 className="text-sm font-medium mb-2">HMAC Header</h4>
              <div className="rounded-md bg-gray-100 p-3 overflow-x-auto font-mono text-xs">
                {log.hmac_header}
              </div>
            </div>
          )}
          
          {log.request_body && log.request_body.length < 500 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Raw Request</h4>
              <div className="rounded-md bg-gray-100 p-3 overflow-x-auto font-mono text-xs">
                {log.request_body}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default IPNLogDetailsSheet;
