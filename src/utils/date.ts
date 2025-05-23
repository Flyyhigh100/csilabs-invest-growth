
/**
 * Format timestamp for display
 */
export function formatTimestamp(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

/**
 * Format date with time for display
 */
export function formatDateWithTime(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleString();
}

/**
 * Format date for display (alias for formatTimestamp)
 */
export function formatDate(dateString: string): string {
  return formatTimestamp(dateString);
}
