
import { toast } from 'sonner';

/**
 * Execute a function with retry logic
 */
export async function executeWithRetries<T>(
  fn: () => Promise<T>,
  toastId: string,
  maxRetries: number = 3
): Promise<{success: boolean, data?: T}> {
  let retryCount = 0;
  let success = false;
  let lastError = null;
  let response = null;
  
  // Update toast with retry information
  const updateToast = (message: string) => {
    toast.loading(message, {
      id: toastId,
      duration: 10000
    });
  };
  
  while (retryCount < maxRetries && !success) {
    try {
      console.log(`🔄 Attempt ${retryCount + 1} of ${maxRetries}`);
      
      // Trigger the retry listener if it exists
      if (typeof (window as any).kycRetryListener === 'function') {
        (window as any).kycRetryListener(retryCount + 1, maxRetries);
      }
      
      // Give a small delay before each retry attempt after the first
      if (retryCount > 0) {
        updateToast(`Retrying... (Attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      response = await fn();
      success = true;
      
      // Clear any retry messages
      toast.dismiss(toastId);
      
      return { success: true, data: response };
    } catch (invokeError: any) {
      console.error('❌ Exception during operation:', invokeError);
      lastError = invokeError;
      retryCount++;
      
      if (retryCount >= maxRetries) {
        break;
      }
      
      updateToast(`Retrying in 1 second... (Attempt ${retryCount + 1}/${maxRetries})`);
      console.log(`Retrying in 1 second... (attempt ${retryCount + 1} of ${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
    }
  }
  
  // After all retries, check if we were successful
  if (!success) {
    console.error('❌ All retry attempts failed:', lastError);
    toast.dismiss(toastId);
    toast.error(`Failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`, {
      duration: 5000
    });
    return { success: false };
  }
  
  return { success: true, data: response };
}
