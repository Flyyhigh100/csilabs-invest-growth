
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
    <Alert variant="success">
      <AlertTitle>Storage Ready</AlertTitle>
      <AlertDescription>
        Using storage bucket: '{bucketName}'
      </AlertDescription>
    </Alert>
  ) : (
    <Alert variant="warning">
      <AlertTitle>Storage Bucket Not Found</AlertTitle>
      <AlertDescription>
        <div className="pt-2 pb-4">
          Storage bucket '{bucketName}' not found. Available buckets: {availableBuckets.length > 0 ? availableBuckets.join(', ') : 'None'}
          <p className="text-sm mt-1">
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
      </AlertDescription>
    </Alert>
  );
};

export default BucketStatusCard;
