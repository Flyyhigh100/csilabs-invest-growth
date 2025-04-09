
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Import components
import DebugPanel from './components/DebugPanel';
import ClarificationMessage from './components/ClarificationMessage';
import DocumentsSection from './components/DocumentsSection';
import SubmissionControls from './components/SubmissionControls';
import SuccessMessage from './components/SuccessMessage';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { showInfoToast } from '@/utils/admin/kyc/verification/utils/toastManager';

interface DocumentVerificationProps {
  hasIdFront: boolean;
  hasIdBack: boolean;
  hasSelfie: boolean;
  isPending: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  onUpload: (file: File, type: 'id_front' | 'id_back' | 'selfie') => Promise<void>;
  onManualRefresh?: () => Promise<void>; // New prop for manual refresh
  clarificationMessage?: string | null;
  debugInfo?: any;
}

const DocumentVerification: React.FC<DocumentVerificationProps> = ({
  hasIdFront,
  hasIdBack,
  hasSelfie,
  isPending,
  isSubmitting,
  onBack,
  onSubmit,
  onUpload,
  onManualRefresh,
  clarificationMessage,
  debugInfo
}) => {
  const { user } = useAuth();
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Live status checking
  useEffect(() => {
    if (!user?.id) return;
    
    const checkLiveStatus = async () => {
      try {
        const { data } = await supabase
          .from('kyc_verifications')
          .select('status, submitted_at')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (data) {
          setLiveStatus(data.status || null);
          setLastRefresh(new Date().toISOString());
          
          // If status has changed to pending, show a message
          if (data.status === 'pending') {
            console.log("🔄 Live status check found pending status:", data);
          }
        }
      } catch (error) {
        console.error('Failed to check live status:', error);
      }
    };
    
    // Check immediately
    checkLiveStatus();
    
    // Set up interval - check every 5 seconds
    const interval = setInterval(checkLiveStatus, 5000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleManualRefresh = async () => {
    if (isRefreshing) {
      showInfoToast('Already refreshing, please wait...');
      return;
    }
    
    setIsRefreshing(true);
    try {
      if (onManualRefresh) {
        await onManualRefresh();
      } else {
        // Fallback if prop not provided
        if (!user?.id) return;
        const { data } = await supabase
          .from('kyc_verifications')
          .select('status')
          .eq('user_id', user.id)
          .single();
        setLiveStatus(data?.status || null);
        setLastRefresh(new Date().toISOString());
      }
    } catch (error) {
      console.error('Error in manual refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check if all required documents are uploaded
  const allDocumentsUploaded = hasIdFront && hasIdBack && hasSelfie;

  return (
    <div className="space-y-6">
      <ClarificationMessage message={clarificationMessage} />
      
      <DebugPanel 
        liveStatus={liveStatus}
        lastRefresh={lastRefresh}
        isPending={isPending}
        isSubmitting={isSubmitting}
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        debugInfo={debugInfo}
      />
      
      <DocumentsSection 
        hasIdFront={hasIdFront}
        hasIdBack={hasIdBack}
        hasSelfie={hasSelfie}
        isPending={isPending}
        onUpload={onUpload}
      />
      
      {/* Manual refresh button */}
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
        </Button>
      </div>
      
      <SubmissionControls 
        isButtonDisabled={!allDocumentsUploaded || isSubmitting || isPending}
        isSubmitting={isSubmitting}
        submissionStatus={isPending ? 'success' : isSubmitting ? 'submitting' : 'idle'}
        onBack={onBack}
        onSubmit={onSubmit}
      />
      
      <SuccessMessage show={liveStatus === 'pending' || isPending} />
    </div>
  );
};

export default DocumentVerification;
