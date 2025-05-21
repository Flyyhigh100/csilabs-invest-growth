
export type BadgeVariant = 
  | 'default' 
  | 'secondary' 
  | 'destructive' 
  | 'outline' 
  | 'success' 
  | 'warning' 
  | 'info';

/**
 * Maps transaction status to appropriate badge variant
 */
export const mapStatusToBadgeVariant = (status: string): BadgeVariant => {
  const normalizedStatus = status.toLowerCase();
  
  switch (normalizedStatus) {
    case 'completed':
      return 'success';
    case 'confirmed':
      return 'info';
    case 'pending':
      return 'warning';
    case 'failed':
    case 'cancelled':
    case 'expired':
      return 'destructive';
    default:
      return 'outline';
  }
};
