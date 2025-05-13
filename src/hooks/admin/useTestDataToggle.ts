
import { useState } from 'react';

export const useTestDataToggle = (initialValue = false) => {
  const [includeTestData, setIncludeTestData] = useState<boolean>(initialValue);
  
  return {
    includeTestData,
    setIncludeTestData,
  };
};
