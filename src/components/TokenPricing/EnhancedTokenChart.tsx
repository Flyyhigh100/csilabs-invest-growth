import React from 'react';
import MultiSourceChartWidget from './MultiSourceChartWidget';
import DataIntegrityNotice from './DataIntegrityNotice';

const EnhancedTokenChart = () => {
  return (
    <div className="space-y-6">
      <DataIntegrityNotice />
      
      <MultiSourceChartWidget />
    </div>
  );
};

export default EnhancedTokenChart;