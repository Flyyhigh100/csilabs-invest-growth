
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface BucketStatusCardProps {
  bucketExists: boolean;
  bucketName: string;
  availableBuckets: string[];
}

const BucketStatusCard: React.FC<BucketStatusCardProps> = ({ 
  bucketExists, 
  bucketName, 
  availableBuckets 
}) => {
  return bucketExists ? (
    <Card className="bg-green-50 border-green-200">
      <CardContent className="pt-6">
        <p className="text-green-800">
          Using storage bucket: '{bucketName}'
        </p>
      </CardContent>
    </Card>
  ) : (
    <Card className="bg-amber-50 border-amber-200">
      <CardContent className="pt-6">
        <p className="text-amber-800">
          Storage bucket '{bucketName}' not found. Available buckets: {availableBuckets.join(', ') || 'None'}
        </p>
      </CardContent>
    </Card>
  );
};

export default BucketStatusCard;
