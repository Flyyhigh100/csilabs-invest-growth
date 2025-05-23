
/**
 * Format timestamp for display
 */
export function formatTimestamp(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString();
}
