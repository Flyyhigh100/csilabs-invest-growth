
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw, AlertCircle } from 'lucide-react';
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
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBucket = async () => {
    try {
      setIsCreating(true);
      setError(null);
      console.log("Attempting to create bucket:", bucketName);
      
      // Check if user is authenticated before proceeding
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("You must be logged in to create a bucket");
        setError("Authentication required");
        return;
      }
      
      // Try direct creation first
      const { data, error } = await supabase
        .storage
        .createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
      
      if (error) {
        console.error("Error creating bucket directly:", error);
        
        // If direct creation fails, try with the edge function
        const { data: authData } = await supabase.auth.getSession();
        const token = authData.session?.access_token;
        
        if (!token) {
          throw new Error("No authentication token available");
        }

        const response = await fetch("https://hrhvliqkmetcdphnetxb.supabase.co/functions/v1/create-storage-bucket", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            bucketName,
            isPublic: true,
            fileSizeLimit: 10485760 // 10MB
          })
        });

        const result = await response.json();
        
        if (!response.ok) {
          console.error("Edge function error:", result);
          throw new Error(result.error || "Failed to create bucket via edge function");
        }
        
        console.log("Bucket creation via edge function result:", result);
        
        if (result.success || result.bucketExists) {
          toast.success(`Storage bucket '${bucketName}' is now available!`);
        } else {
          throw new Error("Edge function did not confirm bucket creation");
        }
      } else {
        toast.success(`Storage bucket '${bucketName}' created successfully!`);
      }
      
      // Important: Give a slight delay before refreshing to ensure the bucket is registered
      setTimeout(() => {
        onRefresh(); // Refresh bucket status after creation
      }, 1500);
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error";
      toast.error(`Error creating bucket: ${errorMessage}`);
      console.error("Exception creating bucket:", error);
      setError(errorMessage);
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
      <AlertTitle className="flex items-center">
        <AlertCircle className="mr-2 h-4 w-4" /> Storage Bucket Not Found
      </AlertTitle>
      <AlertDescription>
        <div className="pt-2 pb-4">
          Storage bucket '{bucketName}' not found. Available buckets: {availableBuckets.length > 0 ? availableBuckets.join(', ') : 'None'}
          <p className="text-sm mt-1">
            Please create the bucket to enable file uploads.
          </p>
          {error && (
            <p className="text-xs mt-1 text-red-500">
              Last error: {error}
            </p>
          )}
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
