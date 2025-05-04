
import React from 'react';
import { UserCheck, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

const AdminDashboard: React.FC = () => {
  
  return (
    <div className="space-y-6">
      {/* Quick actions */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/kyc">
              <UserCheck className="mr-1.5 h-4 w-4" />
              Review KYC
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/transactions">
              <Receipt className="mr-1.5 h-4 w-4" />
              Manage Transactions
            </Link>
          </Button>
        </div>
      </div>
      
    </div>
  );
};

export default AdminDashboard;
