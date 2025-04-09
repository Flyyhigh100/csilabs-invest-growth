
import { useState } from 'react';

export interface DebugInfo {
  currentStatus: string | null | undefined;
  lastAttempt?: string | null;
  submissionDebug?: any;
  attempts?: number;
  errors?: any[];
  apiResponses?: any[];
  lastError?: {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  };
}

/**
 * Hook to manage debug information state
 */
export const useDebugInfo = (initialStatus: string | null | undefined) => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    currentStatus: initialStatus,
    attempts: 0,
    errors: [],
    apiResponses: []
  });

  return { debugInfo, setDebugInfo };
};
