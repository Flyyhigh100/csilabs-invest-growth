
/**
 * Execute a function with retry logic
 */
export const executeWithRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  retryDelay = 1000
): Promise<T> => {
  let lastError: Error;
  
  // Get the retry listener from the global scope if available
  const retryListener = (window as any).kycRetryListener;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Notify listener about the retry attempt
      if (retryListener && typeof retryListener === 'function') {
        retryListener(attempt, maxRetries);
      }
      
      // Execute the function
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`Retry attempt ${attempt}/${maxRetries} failed:`, error);
      
      // Break if this is the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  // If we got here, all retries failed
  throw lastError!;
};

/**
 * Execute a promise with a timeout
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
    
    promise
      .then(result => {
        clearTimeout(timeout);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timeout);
        reject(error);
      });
  });
};
