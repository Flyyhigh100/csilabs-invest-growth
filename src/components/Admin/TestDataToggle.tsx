
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useTestDataToggle } from '@/hooks/admin/useTestDataToggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TestDataToggleProps {
  showAlert?: boolean;
  compact?: boolean;
  className?: string;
}

const TestDataToggle: React.FC<TestDataToggleProps> = ({
  showAlert = false,
  compact = false,
  className = ''
}) => {
  const { includeTestData, toggleTestData } = useTestDataToggle();

  return (
    <div className={`${className}`}>
      {includeTestData && showAlert && (
        <Alert variant="warning" className="mb-4 border-amber-500">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-500">Test Data Visible</AlertTitle>
          <AlertDescription className="text-amber-500">
            You are currently viewing test data along with real data. Toggle off to see only real data.
          </AlertDescription>
        </Alert>
      )}
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center ${compact ? 'gap-1.5' : 'gap-3'} 
              ${includeTestData ? 'bg-amber-100 px-3 py-1.5 rounded-full' : ''}`}
            >
              <Switch
                id="test-data-toggle"
                checked={includeTestData}
                onCheckedChange={toggleTestData}
              />
              <Label 
                htmlFor="test-data-toggle" 
                className={`
                  ${compact ? 'text-xs' : 'text-sm'} 
                  ${includeTestData ? 'text-amber-700 font-medium' : ''}
                `}
              >
                {includeTestData ? 'Including Test Data' : 'Real Data Only'}
              </Label>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {includeTestData 
              ? "Currently showing test data alongside real data" 
              : "Toggle to include test data in views"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default TestDataToggle;
