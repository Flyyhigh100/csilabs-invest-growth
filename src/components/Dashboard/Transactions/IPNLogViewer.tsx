
import React, { useState } from 'react';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface IPNLog {
  id: string;
  provider: string;
  txn_id: string | null;
  status: string | null;
  raw_data: any;
  is_valid: boolean;
  response_status: string | null;
  created_at: string;
  verification_status?: string;
  hmac_header?: string;
  request_body?: string;
}

const IPNLogViewer = () => {
  const [selectedLog, setSelectedLog] = useState<IPNLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: ['ipn-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ipn_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as IPNLog[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  const handleViewDetails = (log: IPNLog) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };
  
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy HH:mm:ss');
    } catch (e) {
      return dateStr;
    }
  };

  const getVerificationBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-[40px]" />
        <Skeleton className="w-full h-[300px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-800">Error loading IPN logs</p>
        </div>
        <p className="mt-2 text-xs text-red-700">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Recent IPN Notifications</h3>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          Refresh
        </Button>
      </div>
      
      {logs && logs.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <AlertCircle className="h-10 w-10 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">No IPN logs found</p>
          <p className="text-xs text-gray-500 mt-1">Webhook notifications will appear here when received</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableCaption>Recent IPN notifications (limited to 20)</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date/Time</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    {formatDate(log.created_at)}
                  </TableCell>
                  <TableCell>{log.provider}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.txn_id || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {log.status ? (
                      <Badge variant="outline">
                        {log.status}
                      </Badge>
                    ) : (
                      <span className="text-gray-500 text-xs">No status</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getVerificationBadge(log.verification_status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewDetails(log)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="w-[90%] sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>IPN Log Details</SheetTitle>
            <SheetDescription>
              Detailed information from IPN notification
            </SheetDescription>
          </SheetHeader>
          
          {selectedLog && (
            <div className="mt-6 space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">General Info</h4>
                <div className="rounded-md border p-3 text-sm space-y-2">
                  <p><span className="font-medium">Provider:</span> {selectedLog.provider}</p>
                  <p><span className="font-medium">Date:</span> {formatDate(selectedLog.created_at)}</p>
                  <p><span className="font-medium">Transaction ID:</span> {selectedLog.txn_id || 'N/A'}</p>
                  <p><span className="font-medium">Status:</span> {selectedLog.status || 'N/A'}</p>
                  <p>
                    <span className="font-medium">Verification:</span>{' '}
                    {selectedLog.verification_status || 'Unknown'}
                  </p>
                  <p>
                    <span className="font-medium">Valid Signature:</span>{' '}
                    {selectedLog.is_valid ? (
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
                  {JSON.stringify(selectedLog.raw_data, null, 2)}
                </pre>
              </div>
              
              {selectedLog.hmac_header && (
                <div>
                  <h4 className="text-sm font-medium mb-2">HMAC Header</h4>
                  <div className="rounded-md bg-gray-100 p-3 overflow-x-auto font-mono text-xs">
                    {selectedLog.hmac_header}
                  </div>
                </div>
              )}
              
              {selectedLog.request_body && selectedLog.request_body.length < 500 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Raw Request</h4>
                  <div className="rounded-md bg-gray-100 p-3 overflow-x-auto font-mono text-xs">
                    {selectedLog.request_body}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default IPNLogViewer;
