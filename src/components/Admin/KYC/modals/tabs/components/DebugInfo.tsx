
import React, { useState } from 'react';
import { InfoIcon, AlertCircle, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { KycVerificationWithProfile } from '../../../types';
import { testDocumentAccess, listBucketContents } from '@/utils/admin/kyc/documents';
import { toast } from 'sonner';

interface DebugInfoProps {
  kyc: KycVerificationWithProfile;
  processedUrls: {
    idFront: string | null;
    idBack: string | null;
    selfie: string | null;
    loading?: boolean;
    error?: string | null;
  };
}

const DebugInfo: React.FC<DebugInfoProps> = ({ kyc, processedUrls }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [accessTestResults, setAccessTestResults] = useState<Record<string, boolean | null>>({});
  const [bucketContents, setBucketContents] = useState<string[]>([]);
  const [isTestingAccess, setIsTestingAccess] = useState(false);
  const [isListingBucket, setIsListingBucket] = useState(false);
  
  const runAccessTests = async () => {
    setIsTestingAccess(true);
    try {
      const results = {
        idFront: kyc.id_front_url ? await testDocumentAccess(kyc.id_front_url) : null,
        idBack: kyc.id_back_url ? await testDocumentAccess(kyc.id_back_url) : null,
        selfie: kyc.selfie_url ? await testDocumentAccess(kyc.selfie_url) : null
      };
      
      setAccessTestResults(results);
      
      const successes = Object.values(results).filter(r => r === true).length;
      const failures = Object.values(results).filter(r => r === false).length;
      
      if (failures === 0 && successes > 0) {
        toast.success(`All ${successes} documents accessible!`);
      } else if (failures > 0) {
        toast.error(`${failures} document(s) inaccessible. Check debug info.`);
      } else {
        toast.info('No documents to test access for.');
      }
    } catch (error) {
      console.error('Error running access tests:', error);
      toast.error('Failed to test document access');
    } finally {
      setIsTestingAccess(false);
    }
  };
  
  const listBucketContent = async () => {
    setIsListingBucket(true);
    try {
      // Extract bucket from first document path
      let bucketName = 'kyc-documents'; // Default
      const docPath = kyc.id_front_url || kyc.id_back_url || kyc.selfie_url;
      
      if (docPath && docPath.includes('/') && !docPath.startsWith('http')) {
        bucketName = docPath.split('/')[0];
      }
      
      const contents = await listBucketContents(bucketName);
      setBucketContents(contents);
      
      if (contents.length > 0) {
        toast.success(`Found ${contents.length} items in bucket "${bucketName}"`);
      } else {
        toast.info(`Bucket "${bucketName}" is empty or inaccessible`);
      }
    } catch (error) {
      console.error('Error listing bucket contents:', error);
      toast.error('Failed to list bucket contents');
    } finally {
      setIsListingBucket(false);
    }
  };
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="bg-gray-50 rounded-md border border-gray-200 overflow-hidden">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full flex items-center justify-between p-3 h-auto text-gray-500 hover:text-gray-700">
          <div className="flex items-center">
            <InfoIcon className="h-4 w-4 mr-2" />
            <span>Debug Information</span>
          </div>
          <span className="text-xs">{isOpen ? 'Hide' : 'Show'}</span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-3 pt-0 text-xs">
        <div className="space-y-3">
          <div className="font-mono overflow-x-auto">
            <div className="flex space-x-4 mb-3">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={runAccessTests}
                disabled={isTestingAccess}
                className="text-xs"
              >
                {isTestingAccess ? 'Testing...' : 'Test Document Access'}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={listBucketContent}
                disabled={isListingBucket}
                className="text-xs"
              >
                {isListingBucket ? 'Listing...' : 'List Bucket Contents'}
              </Button>
            </div>
            
            <p className="font-semibold mb-1">Document URLs in Database:</p>
            <div className="bg-white p-2 rounded border border-gray-200 mb-2">
              <p>ID Front: {kyc.id_front_url || 'Not provided'}</p>
              <p>ID Back: {kyc.id_back_url || 'Not provided'}</p>
              <p>Selfie: {kyc.selfie_url || 'Not provided'}</p>
            </div>
            
            <p className="font-semibold mb-1">Processed URLs:</p>
            <div className="bg-white p-2 rounded border border-gray-200 mb-2">
              <p>ID Front: {processedUrls.idFront || 'Failed to process'}</p>
              <p>ID Back: {processedUrls.idBack || 'Failed to process'}</p>
              <p>Selfie: {processedUrls.selfie || 'Failed to process'}</p>
            </div>
            
            {Object.keys(accessTestResults).length > 0 && (
              <>
                <p className="font-semibold mb-1">Access Test Results:</p>
                <div className="bg-white p-2 rounded border border-gray-200 mb-2">
                  {Object.entries(accessTestResults).map(([key, result]) => (
                    <div key={key} className="flex items-center">
                      <span className="mr-2">{key}:</span>
                      {result === true && <span className="text-green-600">Accessible ✓</span>}
                      {result === false && <span className="text-red-600">Inaccessible ✗</span>}
                      {result === null && <span className="text-gray-400">Not tested</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {bucketContents.length > 0 && (
              <>
                <p className="font-semibold mb-1">Bucket Contents:</p>
                <div className="bg-white p-2 rounded border border-gray-200 mb-2 max-h-40 overflow-y-auto">
                  {bucketContents.map((item, index) => (
                    <p key={index}>{item}</p>
                  ))}
                </div>
              </>
            )}
          </div>
            
          {(processedUrls.error || Object.values(accessTestResults).some(r => r === false)) && (
            <div className="bg-amber-50 p-2 rounded border border-amber-200 mb-2">
              <p className="flex items-center font-medium text-amber-800 mb-1">
                <AlertCircle className="h-3 w-3 mr-1" /> Troubleshooting Tips
              </p>
              <ul className="list-disc list-inside text-amber-700 space-y-1">
                <li>Check that storage buckets are properly configured</li>
                <li>RLS policies on storage.objects might be restricting access</li>
                <li>Ensure the document paths in the database are correct</li>
                <li>Verify that the stored files actually exist in storage</li>
              </ul>
            </div>
          )}
            
          <p className="text-xs text-gray-400 mt-2">
            Document loading issues often occur due to RLS policies or incorrect storage paths
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default DebugInfo;
