
import { format, parseISO } from 'date-fns';

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  } catch (error) {
    console.error("Date parsing error:", error);
    return 'Invalid date';
  }
};
