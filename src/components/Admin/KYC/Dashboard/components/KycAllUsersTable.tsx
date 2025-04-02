
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface User {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  kyc_status?: string | null;
}

interface KycAllUsersTableProps {
  allUsersWithKyc: User[];
}

const KycAllUsersTable: React.FC<KycAllUsersTableProps> = ({ allUsersWithKyc }) => {
  return (
    <Card className="bg-slate-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">All Users with KYC Status</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xs overflow-auto max-h-60">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-1">User ID</th>
                <th className="text-left p-1">Name</th>
                <th className="text-left p-1">KYC Status</th>
              </tr>
            </thead>
            <tbody>
              {allUsersWithKyc.map(user => (
                <tr key={user.id} className="border-b">
                  <td className="p-1 font-mono text-xs">{user.id}</td>
                  <td className="p-1">{user.first_name} {user.last_name}</td>
                  <td className="p-1">
                    <span className={
                      user.kyc_status === 'approved' ? 'text-green-600' :
                      user.kyc_status === 'pending' ? 'text-amber-600' :
                      user.kyc_status === 'rejected' ? 'text-red-600' :
                      'text-gray-600'
                    }>
                      {user.kyc_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default KycAllUsersTable;
