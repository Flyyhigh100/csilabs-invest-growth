
/**
 * Formats a timestamp to a readable date
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date string
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  
  // For recent data, use month and day format (Apr 15)
  return date.toLocaleDateString('en-US', { 
    month: 'short',
    day: 'numeric'
  });
};
