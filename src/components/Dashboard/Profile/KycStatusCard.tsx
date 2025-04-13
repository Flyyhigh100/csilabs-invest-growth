
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import KycStatusBanner from '@/components/Dashboard/KycStatusBanner';

const KycStatusCard: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Verification Status</CardTitle>
        <CardDescription>Your identity verification status</CardDescription>
      </CardHeader>
      <CardContent>
        <KycStatusBanner />
      </CardContent>
    </Card>
  );
};

export default KycStatusCard;
