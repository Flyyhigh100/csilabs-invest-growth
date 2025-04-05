
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw } from 'lucide-react';
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
  const [isCreating, setIsCreating] = React.useState(false);

  const createBucket = async () => {
    try {
      setIsCreating(true);
      console.log("Attempting to create bucket:", bucketName);
      
      // Check if user is authenticated before proceeding
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("You must be logged in to create a bucket");
        return;
      }
      
      const { data, error } = await supabase
        .storage
        .createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
      
      if (error) {
        console.error("Error creating bucket:", error);
        toast.error(`Failed to create bucket: ${error.message}`);
        return;
      }
      
      toast.success(`Storage bucket '${bucketName}' created successfully!`);
      
      // Important: Give a slight delay before refreshing to ensure the bucket is registered
      setTimeout(() => {
        onRefresh(); // Refresh bucket status after creation
      }, 1000);
    } catch (error: any) {
      toast.error(`Error creating bucket: ${error.message}`);
      console.error("Exception creating bucket:", error);
    } finally {
      setIsCreating(false);
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
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Creating...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Bucket
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BucketStatusCard;
