
import { format, isValid, parseISO } from 'date-fns';

/**
 * Format a date string in a consistent format across the application
 * @param dateString ISO date string
 * @param formatString Optional format string (default: MMM dd, yyyy)
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | null | undefined, formatString: string = 'MMM dd, yyyy'): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    
    if (!isValid(date)) {
      return 'Invalid date';
    }
    
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error';
  }
};

/**
 * Format a date with time in a consistent format
 * @param dateString ISO date string
 * @returns Formatted date string with time
 */
export const formatDateWithTime = (dateString: string | null | undefined): string => {
  return formatDate(dateString, 'MMM dd, yyyy h:mm a');
};
