
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";

const KycWarning: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Required</CardTitle>
        <CardDescription>You need to complete KYC verification before making payments</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Identity Verification Required</AlertTitle>
          <AlertDescription>
            To comply with financial regulations, we need to verify your identity before you can make any payments or purchase tokens.
          </AlertDescription>
        </Alert>
        <Button asChild>
          <Link to="/dashboard/kyc">Complete Verification</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default KycWarning;
