
import React from 'react';
import { Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  onExportCSV: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onExportCSV }) => {
  return (
    <>
      <Button type="submit" variant="outline" className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        Apply Filters
      </Button>
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={onExportCSV}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
    </>
  );
};

export default ActionButtons;
