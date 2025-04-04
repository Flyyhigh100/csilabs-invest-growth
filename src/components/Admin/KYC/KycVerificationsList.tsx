
import React from 'react';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileCheck, User, Eye, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { KycVerificationWithProfile } from './types';

interface KycVerificationsListProps {
  verifications: KycVerificationWithProfile[];
  onViewDetails: (verification: KycVerificationWithProfile) => void;
}

const KycVerificationsList: React.FC<KycVerificationsListProps> = ({ 
  verifications, 
  onViewDetails 
}) => {
  if (verifications.length === 0) {
    return (
      <div className="text-center py-8">
        <FileCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No verifications
        </h3>
        <p className="text-gray-500">
          There are no KYC verification requests at this time.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date Submitted</TableHead>
          <TableHead>Date Reviewed</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {verifications.map((verification) => (
          <TableRow key={verification.id || verification.user_id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 p-1.5 rounded-full">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium">
                    {verification.first_name || verification.profile_first_name || 'Unknown'} {verification.last_name || verification.profile_last_name || 'User'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {/* Show either KYC form name or profile name as fallback */}
                    {verification.profile_first_name && !verification.first_name ? 
                      `${verification.profile_first_name} ${verification.profile_last_name}` : 
                      'ID: ' + verification.user_id?.substring(0, 8)}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              {verification.status === 'pending' && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Pending
                </Badge>
              )}
              {verification.status === 'approved' && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" /> Approved
                </Badge>
              )}
              {verification.status === 'rejected' && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <XCircle className="h-3 w-3 mr-1" /> Rejected
                </Badge>
              )}
              {verification.status === 'not_started' && (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  Not Submitted
                </Badge>
              )}
              {verification.status === 'needs_clarification' && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Needs Clarification
                </Badge>
              )}
            </TableCell>
            <TableCell>
              {verification.submitted_at 
                ? formatDistanceToNow(new Date(verification.submitted_at), { addSuffix: true })
                : 'Not submitted'}
            </TableCell>
            <TableCell>
              {verification.reviewed_at 
                ? formatDistanceToNow(new Date(verification.reviewed_at), { addSuffix: true })
                : '-'}
            </TableCell>
            <TableCell className="text-right">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={() => onViewDetails(verification)}
              >
                <Eye className="h-3.5 w-3.5" /> View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default KycVerificationsList;
