import React from 'react';
import RealTimePriceDisplay from './RealTimePriceDisplay';
import DataIntegrityNotice from './DataIntegrityNotice';

const EnhancedTokenChart = () => {
  return (
    <div className="space-y-6">
      <DataIntegrityNotice />
      
      <RealTimePriceDisplay />
    </div>
  );
};

export default EnhancedTokenChart;