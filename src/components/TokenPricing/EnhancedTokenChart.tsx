import React from 'react';
import LiveTokenChart from './LiveTokenChart';
import DataIntegrityNotice from './DataIntegrityNotice';

const EnhancedTokenChart = () => {
  return (
    <div className="space-y-6">
      <DataIntegrityNotice />
      
      <LiveTokenChart />
    </div>
  );
};

export default EnhancedTokenChart;