
import React from 'react';
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
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { IPNLog } from './types';

interface IPNLogTableProps {
  logs: IPNLog[];
  onViewDetails: (log: IPNLog) => void;
}

const IPNLogTable: React.FC<IPNLogTableProps> = ({ logs, onViewDetails }) => {
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

  return (
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
          {logs.map((log) => (
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
                  onClick={() => onViewDetails(log)}
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
  );
};

export default IPNLogTable;
