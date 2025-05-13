
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useGlobalTestDataToggle } from '@/hooks/admin/useTestDataToggle';

interface TestDataToggleProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  showAlert?: boolean;
  compact?: boolean;
  className?: string;
}

const TestDataToggle: React.FC<TestDataToggleProps> = ({
  checked: externalChecked,
  onCheckedChange: externalOnCheckedChange,
  showAlert = true,
  compact = false,
  className = ""
}) => {
  // Use the global test data toggle if no external state is provided
  const { includeTestData, setIncludeTestData } = useGlobalTestDataToggle();
  
  // Determine if we're using external or internal state
  const isControlled = externalChecked !== undefined && externalOnCheckedChange !== undefined;
  const checked = isControlled ? externalChecked : includeTestData;
  
  const handleToggle = (newValue: boolean) => {
    if (isControlled) {
      externalOnCheckedChange!(newValue);
    } else {
      setIncludeTestData(newValue);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className={`flex ${compact ? 'items-center space-x-2' : 'space-x-2'}`}>
        <Switch 
          id="include-test-data" 
          checked={checked}
          onCheckedChange={handleToggle}
        />
        <Label htmlFor="include-test-data" className={compact ? "text-sm" : ""}>
          Include test data
        </Label>
      </div>
      
      {showAlert && checked && (
        <Alert variant="warning" className="py-2">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription className="text-xs">
            Test data is included in the results. These transactions are not real.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TestDataToggle;
