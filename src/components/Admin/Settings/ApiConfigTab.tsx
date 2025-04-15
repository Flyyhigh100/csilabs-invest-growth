
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import APIKeyValidator from '@/components/Admin/APIKeyValidator';

interface ApiConfigTabProps {
  apiUrl: string;
  setApiUrl: (value: string) => void;
  apiTimeout: string;
  setApiTimeout: (value: string) => void;
  onSave: () => void;
}

const ApiConfigTab: React.FC<ApiConfigTabProps> = ({
  apiUrl,
  setApiUrl,
  apiTimeout,
  setApiTimeout,
  onSave,
}) => {
  return (
    <>
      <APIKeyValidator />
      
      <Card>
        <CardHeader>
          <CardTitle>API Settings</CardTitle>
          <CardDescription>
            Configure the API integrations and parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="api-url">Defined.fi API URL</Label>
              <Input 
                id="api-url" 
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.defined.fi/api/v1"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="api-timeout">API Timeout (seconds)</Label>
              <Input 
                id="api-timeout"
                type="number"
                value={apiTimeout}
                onChange={(e) => setApiTimeout(e.target.value)}
                placeholder="30"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={onSave}>
                Save API Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ApiConfigTab;
