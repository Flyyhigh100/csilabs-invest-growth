
import React from 'react';
import IPNLogViewer from './IPNLogs/IPNLogViewer';

const AdminIpnLogSection = () => {
  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">IPN Log Viewer (Admin)</h3>
      <IPNLogViewer />
    </div>
  );
};

export default AdminIpnLogSection;
