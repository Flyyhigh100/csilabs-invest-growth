
/**
 * Utility for managing retry attempts for KYC verification
 */
import { notifyRetryAttempt } from './listenerManager';

/**
 * Execute function with retry logic
 * @param fn Function to execute with retry logic
 * @param maxRetries Maximum number of retries
 * @param retryDelay Delay between retries in ms
 */
export const executeWithRetry = async<T>(
  fn: () => Promise<T>,
  maxRetries: number = 1,
  retryDelay: number = 2000
): Promise<T> => {
  let currentRetry = 0;
  let lastError: Error | null = null;

  while (currentRetry <= maxRetries) {
    notifyRetryAttempt(currentRetry, maxRetries);

    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${currentRetry + 1} failed:`, error);

      // Only retry on specific network errors
      if (currentRetry < maxRetries && 
          ((error as Error).message.includes('timeout') || 
           (error as Error).message.includes('network'))) {
        currentRetry++;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }

      // Non-retryable error or max retries reached
      break;
    }
  }

  // If we get here, all retries failed
  throw lastError || new Error('Operation failed after multiple attempts');
};

/**
 * Promise with timeout
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Request timed out'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
};
