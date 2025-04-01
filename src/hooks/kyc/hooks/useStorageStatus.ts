
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { kycLogger, LogLevel } from '@/hooks/kyc/utils/logger';
import { 
  checkStorageAvailability, 
  initializeStorage,
  testStorageConnection,
  getStorageStatus,
  resetStorageInitialization,
  StorageStatus
} from '@/services/storage/initStorage';

export function useStorageStatus() {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isStorageChecking, setIsStorageChecking] = useState(false);
  const [storageStatus, setStorageStatus] = useState<StorageStatus>(getStorageStatus());
  
  // Check storage on mount
  useEffect(() => {
    checkStorage();
  }, []);
  
  const checkStorage = async () => {
    try {
      setIsStorageChecking(true);
      kycLogger.log(LogLevel.INFO, 'Checking storage availability');
      
      // Check if storage is available
      const status = await checkStorageAvailability();
      
      if (status === 'available') {
        kycLogger.log(LogLevel.INFO, 'Storage is available');
        setStorageStatus('available');
        setUploadError(null);
      } else if (status === 'error') {
        kycLogger.log(LogLevel.ERROR, 'Storage initialization previously failed');
        setStorageStatus('error');
        setUploadError('Storage service encountered an error. Please try to reinitialize or contact support.');
      } else {
        kycLogger.log(LogLevel.WARN, 'Storage not available, attempting to initialize');
        
        // Try to initialize storage
        const initialized = await initializeStorage();
        
        if (initialized) {
          kycLogger.log(LogLevel.INFO, 'Storage initialized successfully');
          setStorageStatus('available');
          setUploadError(null);
        } else {
          kycLogger.log(LogLevel.ERROR, 'Storage initialization failed');
          setStorageStatus('unavailable');
          setUploadError('Storage service is currently unavailable. Please try again later or contact support.');
        }
      }
    } catch (error) {
      kycLogger.log(LogLevel.ERROR, 'Error checking storage:', error);
      setStorageStatus('unavailable');
      setUploadError('Unable to connect to storage service. Please try again later.');
    } finally {
      setIsStorageChecking(false);
    }
  };
  
  const handleRetryStorage = async () => {
    setIsStorageChecking(true);
    setUploadError(null);
    
    try {
      kycLogger.log(LogLevel.INFO, 'Manually retrying storage initialization');
      
      // Test connection first
      const isConnected = await testStorageConnection();
      
      if (!isConnected) {
        setStorageStatus('unavailable');
        setUploadError('Cannot connect to storage service. Please check your network connection.');
        toast.error('Cannot connect to storage service');
        return;
      }
      
      // Reset initialization counters to allow a fresh start
      resetStorageInitialization();
      
      // Try to initialize
      const initialized = await initializeStorage();
      
      if (initialized) {
        // Force check with latest status
        const status = await checkStorageAvailability(true);
        setStorageStatus(status);
        
        if (status === 'available') {
          toast.success('Storage service is now available');
          setUploadError(null);
        } else {
          setUploadError('Storage is still unavailable. Please try again later or contact support.');
          toast.error('Storage service is still unavailable');
        }
      } else {
        setStorageStatus('unavailable');
        setUploadError('Storage initialization failed. Please try again later or contact support.');
        toast.error('Storage service initialization failed');
      }
    } catch (error) {
      kycLogger.log(LogLevel.ERROR, 'Error retrying storage check:', error);
      setStorageStatus('unavailable');
      setUploadError('Unable to connect to storage service. Please try again later.');
      toast.error('Storage service connection failed');
    } finally {
      setIsStorageChecking(false);
    }
  };

  return {
    storageStatus,
    uploadError,
    isStorageChecking,
    setUploadError,
    handleRetryStorage,
    checkStorage
  };
}
