
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BucketStatusCardProps {
  bucketExists: boolean;
  bucketName: string;
  availableBuckets: string[];
  onRefresh: () => void;
}

const BucketStatusCard: React.FC<BucketStatusCardProps> = ({ 
  bucketExists, 
  bucketName, 
  availableBuckets,
  onRefresh
}) => {
  const createBucket = async () => {
    try {
      const { data, error } = await supabase
        .storage
        .createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
      
      if (error) {
        toast.error(`Failed to create bucket: ${error.message}`);
        console.error("Error creating bucket:", error);
        return;
      }
      
      toast.success(`Storage bucket '${bucketName}' created successfully!`);
      onRefresh();
    } catch (error: any) {
      toast.error(`Error creating bucket: ${error.message}`);
      console.error("Exception creating bucket:", error);
    }
  };

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
      <CardContent className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-amber-800 mb-2">
            Storage bucket '{bucketName}' not found. Available buckets: {availableBuckets.length > 0 ? availableBuckets.join(', ') : 'None'}
          </p>
          <p className="text-sm text-amber-700">
            Please create the bucket to enable file uploads.
          </p>
        </div>
        <Button 
          variant="secondary" 
          className="bg-amber-500 text-white hover:bg-amber-600"
          onClick={createBucket}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Create Bucket
        </Button>
      </CardContent>
    </Card>
  );
};

export default BucketStatusCard;
