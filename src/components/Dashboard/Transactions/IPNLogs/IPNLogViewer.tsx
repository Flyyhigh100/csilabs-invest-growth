
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export interface IPNLog {
  id: string;
  provider: string;
  txn_id: string | null;
  status: string | null;
  raw_data: any;
  is_valid: boolean;
  response_status: string | null;
  created_at: string;
  hmac_header?: string | null;
  request_body?: string | null;
  processing_status?: string | null;
  error_message?: string | null;
}

// Status Badge Component
const StatusBadge = ({ status }: { status: string | null }) => {
  if (!status) return null;
  
  switch (status.toLowerCase()) {
    case 'completed':
      return <Badge variant="success" className="bg-green-100 text-green-800">Completed</Badge>;
    case 'confirmed':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Confirmed</Badge>;
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

// Validity Icon Component
const ValidityIcon = ({ isValid }: { isValid: boolean }) => {
  return isValid ? 
    <CheckCircle className="h-5 w-5 text-green-500" /> : 
    <XCircle className="h-5 w-5 text-red-500" />;
};

// Details Sheet Component
const IPNLogDetailsSheet = ({ 
  isOpen, 
  onClose, 
  log 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  log: IPNLog | null 
}) => {
  if (!log) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[90vw] max-w-[700px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>IPN Log Details</SheetTitle>
          <SheetDescription>
            Details for IPN notification {log.txn_id || log.id}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium">Basic Information</h4>
            <div className="mt-2 rounded-md bg-slate-50 p-4">
              <p className="text-xs"><strong>Provider:</strong> {log.provider}</p>
              <p className="text-xs"><strong>Transaction ID:</strong> {log.txn_id || 'N/A'}</p>
              <p className="text-xs"><strong>Status:</strong> {log.status || 'N/A'}</p>
              <p className="text-xs"><strong>Created At:</strong> {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}</p>
              <p className="text-xs"><strong>Valid:</strong> {log.is_valid ? 'Yes' : 'No'}</p>
              <p className="text-xs"><strong>Response Status:</strong> {log.response_status || 'N/A'}</p>
              <p className="text-xs"><strong>Processing Status:</strong> {log.processing_status || 'N/A'}</p>
              {log.error_message && (
                <p className="text-xs text-red-600"><strong>Error:</strong> {log.error_message}</p>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium">Raw Data</h4>
            <div className="mt-2">
              <pre className="text-xs bg-slate-50 p-4 rounded-md overflow-auto max-h-[200px]">
                {JSON.stringify(log.raw_data, null, 2)}
              </pre>
            </div>
          </div>
          
          {log.request_body && (
            <div>
              <h4 className="text-sm font-medium">Request Body</h4>
              <div className="mt-2">
                <pre className="text-xs bg-slate-50 p-4 rounded-md overflow-auto max-h-[150px]">
                  {log.request_body}
                </pre>
              </div>
            </div>
          )}
          
          {log.hmac_header && (
            <div>
              <h4 className="text-sm font-medium">HMAC Header</h4>
              <div className="mt-2">
                <p className="text-xs bg-slate-50 p-4 rounded-md overflow-auto">
                  {log.hmac_header}
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Empty State Component
const IPNLogEmptyState = () => (
  <div className="text-center py-8 text-gray-500">
    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
    <p>No IPN logs found. Webhook notifications will appear here when received.</p>
  </div>
);

// Loading State Component
const IPNLogLoadingState = () => (
  <div className="p-8 text-center">
    <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-gray-400" />
    <p className="text-gray-500">Loading IPN logs...</p>
  </div>
);

// Error State Component
const IPNLogErrorState = ({ error }: { error: Error }) => (
  <div className="p-8 text-center text-red-500">
    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
    <p>Error loading IPN logs: {error.message}</p>
  </div>
);

// Table Header Component
const IPNLogHeader = ({ refetch }: { refetch: () => void }) => (
  <div className="flex justify-between items-center mb-4">
    <div>
      <h3 className="text-lg font-medium">IPN Logs</h3>
      <p className="text-sm text-muted-foreground">
        Recent IPN notifications from payment providers
      </p>
    </div>
    <Button 
      variant="outline" 
      size="sm" 
      onClick={refetch}
    >
      <RefreshCw className="h-3.5 w-3.5 mr-1" />
      Refresh
    </Button>
  </div>
);

// Main Component
const IPNLogViewer = () => {
  const [selectedLog, setSelectedLog] = React.useState<IPNLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: ['ipn-logs'],
    queryFn: async () => {
      // Use type casting to work around the TypeScript limitation
      // since ipn_logs table exists in the database but isn't in the TypeScript types yet
      try {
        console.log("Fetching IPN logs...");
        const { data, error } = await (supabase as any)
          .from('ipn_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) {
          console.error("Error fetching IPN logs:", error);
          throw error;
        }
        
        console.log(`Fetched ${data?.length || 0} IPN logs`);
        return data as IPNLog[];
      } catch (err) {
        console.error("Exception fetching IPN logs:", err);
        throw err;
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleViewDetails = (log: IPNLog) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };

  if (isLoading) return <IPNLogLoadingState />;
  if (error) return <IPNLogErrorState error={error as Error} />;

  return (
    <div>
      <IPNLogHeader refetch={() => refetch()} />
      
      {logs && logs.length === 0 ? (
        <IPNLogEmptyState />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>Most recent IPN logs (limited to 100)</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Time</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valid</TableHead>
                <TableHead>Response</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                  </TableCell>
                  <TableCell>{log.provider}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.txn_id ? log.txn_id : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={log.status} />
                  </TableCell>
                  <TableCell>
                    <ValidityIcon isValid={log.is_valid} />
                  </TableCell>
                  <TableCell>
                    {log.response_status || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewDetails(log)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <IPNLogDetailsSheet 
        isOpen={isDetailsOpen} 
        onClose={handleCloseDetails} 
        log={selectedLog} 
      />
    </div>
  );
};

export default IPNLogViewer;
