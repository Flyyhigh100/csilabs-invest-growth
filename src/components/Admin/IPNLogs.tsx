
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface IPNLog {
  id: string;
  provider: string;
  txn_id: string | null;
  status: string | null;
  raw_data: any;
  is_valid: boolean;
  response_status: string | null;
  created_at: string;
}

const IPNLogs = () => {
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['ipn-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ipn_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as IPNLog[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge variant="success" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getValidityIcon = (isValid: boolean) => {
    return isValid ? 
      <CheckCircle className="h-5 w-5 text-green-500" /> : 
      <XCircle className="h-5 w-5 text-red-500" />;
  };

  if (isLoading) return <div className="p-8 text-center">Loading IPN logs...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error loading IPN logs: {(error as Error).message}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>IPN Logs</CardTitle>
        <CardDescription>
          Recent IPN notifications received from payment providers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs && logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No IPN logs found. Webhook notifications will appear here when received.</p>
          </div>
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
                      {getStatusBadge(log.status)}
                    </TableCell>
                    <TableCell>
                      {getValidityIcon(log.is_valid)}
                    </TableCell>
                    <TableCell>
                      {log.response_status || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <details>
                        <summary className="cursor-pointer text-blue-600 text-sm">
                          View Raw Data
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto max-h-40">
                          {JSON.stringify(log.raw_data, null, 2)}
                        </pre>
                      </details>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IPNLogs;
